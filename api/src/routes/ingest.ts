import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { contractService } from '../services/contractService';
import { CreateContractRequest } from '../types/contract';

export const ingestRoutes = Router();

/**
 * Payload accepted by the document-ingestion webhook.
 *
 * Modelled loosely on the Paperless-ngx / Papra document webhook shape but kept
 * permissive: unknown extra fields are ignored so external systems can send
 * their full document object without breaking us.
 *
 * `documentId` may be a string or a number (Paperless-ngx uses numeric ids); it
 * is coerced to a string internally.
 */
const ingestDocumentSchema = z
  .object({
    title: z.string().trim().min(1, 'title is required'),
    correspondent: z.string().trim().min(1).optional(),
    documentId: z.union([z.string().trim().min(1), z.number()]).transform(String),
    tags: z.array(z.string().trim().min(1)).optional(),
    // Optional passthroughs that map cleanly onto a Contract.
    notes: z.string().optional(),
    documentLink: z.string().url().optional(),
  })
  .passthrough();

export type IngestDocumentPayload = z.infer<typeof ingestDocumentSchema>;

/**
 * POST /api/ingest/document
 *
 * Webhook endpoint for external document management systems (Paperless-ngx,
 * Papra, ...) to auto-create a *draft* contract when a new document is scanned.
 *
 * The route is mounted behind `requireAuth`, so it accepts the same machine
 * credentials as the rest of the API (`Authorization: Bearer <API_TOKEN>` or
 * `X-API-Key`), plus a dedicated `INGEST_TOKEN` handled by its own middleware.
 *
 * The created contract is always a draft (`draft: true`) so the user must
 * review it before it counts as a real, active contract.
 */
ingestRoutes.post('/document', async (req: Request, res: Response) => {
  const parsed = ingestDocumentSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid ingest payload',
      details: parsed.error.flatten(),
    });
  }

  const payload = parsed.data;

  try {
    // Map the external document onto our internal Contract shape. The document
    // id doubles as the human-readable contractId so that (a) re-sending the
    // same document is idempotent (createContract dedupes on contractId) and
    // (b) the Paperless tag derives from it (c:<first 8 chars>).
    const contractId = `paperless-${payload.documentId}`;

    const createRequest: CreateContractRequest = {
      contractId,
      name: payload.title,
      reference: String(payload.documentId),
      company: payload.correspondent,
      // A draft contract: status stays at the default 'active' but the draft
      // flag flips the UI into "needs review" mode.
      draft: true,
      needsMoreInfo: true,
      status: 'active',
      tags: payload.tags,
      notes: payload.notes,
      documentLink: payload.documentLink,
      paperlessCorrespondent: payload.correspondent,
      // Prefer an explicit paperless tag if the source sent one, otherwise let
      // the contractService/paperlessService derive the default c:<uuid> tag.
      paperlessTag: payload.tags && payload.tags.length > 0 ? payload.tags[0] : undefined,
    };

    const result = await contractService.createContract(createRequest);

    if (result.created) {
      return res.status(201).json({
        id: result.contract.id,
        contractId: result.contract.contractId,
        status: result.contract.status,
        draft: result.contract.draft,
        created: true,
      });
    }

    // Idempotent no-op: the document was already ingested.
    return res.status(200).json({
      id: result.contract.id,
      contractId: result.contract.contractId,
      status: result.contract.status,
      draft: result.contract.draft,
      created: false,
    });
  } catch (error) {
    console.error('Error ingesting document:', error);
    return res.status(500).json({ error: 'Failed to ingest document' });
  }
});
