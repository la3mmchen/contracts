// api/src/routes/paperless.ts

import { Router, Request, Response } from 'express';
import { paperlessService } from '../services/paperlessService';

export const paperlessRoutes = Router();

// GET /api/paperless/status - Check if Paperless is configured and available
paperlessRoutes.get('/status', async (req: Request, res: Response) => {
  try {
    const status = await paperlessService.checkStatus();
    res.json(status);
  } catch (error) {
    console.error('Error checking Paperless status:', error);
    res.status(500).json({
      configured: paperlessService.isConfigured(),
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/paperless/cache - Get cache statistics
paperlessRoutes.get('/cache', (req: Request, res: Response) => {
  const stats = paperlessService.getCacheStats();
  res.json({
    ...stats,
    total: stats.correspondents + stats.documentTypes + stats.tags,
  });
});

// DELETE /api/paperless/cache - Clear the cache
paperlessRoutes.delete('/cache', (req: Request, res: Response) => {
  paperlessService.clearCache();
  res.json({ message: 'Cache cleared' });
});

// GET /api/paperless/documents/:contractId - Get documents for a contract
paperlessRoutes.get('/documents/:contractId', async (req: Request, res: Response) => {
  try {
    if (!paperlessService.isConfigured()) {
      return res.status(503).json({
        error: 'Paperless integration not configured',
        configured: false,
      });
    }

    const { contractId } = req.params;
    const customTag = req.query.tag as string | undefined;
    const correspondent = req.query.correspondent as string | undefined;
    const result = await paperlessService.getDocumentsForContract(contractId, customTag, correspondent);
    res.json(result);
  } catch (error) {
    console.error('Error fetching Paperless documents:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch documents',
    });
  }
});
