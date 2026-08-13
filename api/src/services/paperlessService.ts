// api/src/services/paperlessService.ts

import {
  PaperlessDocument,
  PaperlessDocumentsResponse,
  PaperlessTag,
  PaperlessCorrespondent,
  PaperlessDocumentType,
  PaperlessStatusResponse,
  ContractDocument,
  ContractDocumentsResponse,
  DiscoverySuggestion,
  ContractDocumentsDiscoveryResponse,
} from '../types/paperless';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class PaperlessService {
  private baseUrl: string | undefined;
  private publicUrl: string | undefined;
  private apiToken: string | undefined;
  
  // Cache for metadata (correspondents, document types, tags)
  private correspondentCache: Map<number, CacheEntry<PaperlessCorrespondent>> = new Map();
  private correspondentByNameCache: Map<string, CacheEntry<PaperlessCorrespondent | null>> = new Map();
  private documentTypeCache: Map<number, CacheEntry<PaperlessDocumentType>> = new Map();
  private tagCache: Map<string, CacheEntry<PaperlessTag | null>> = new Map();
  
  // Cache TTL in milliseconds (default: 5 minutes)
  private readonly CACHE_TTL = 5 * 60 * 1000;

  constructor() {
    this.baseUrl = process.env.PAPERLESS_URL;
    // Public/external base URL used only for user-facing document links that
    // the browser opens. Falls back to the internal PAPERLESS_URL when unset.
    this.publicUrl = process.env.PAPERLESS_PUBLIC_URL || process.env.PAPERLESS_URL;
    this.apiToken = process.env.PAPERLESS_API_TOKEN;
  }

  isConfigured(): boolean {
    return !!(this.baseUrl && this.apiToken);
  }

  private isCacheValid<T>(entry: CacheEntry<T> | undefined): entry is CacheEntry<T> {
    return entry !== undefined && Date.now() < entry.expiresAt;
  }

  private setCacheEntry<T>(cache: Map<string | number, CacheEntry<T>>, key: string | number, data: T): void {
    cache.set(key, {
      data,
      expiresAt: Date.now() + this.CACHE_TTL,
    });
  }

  getCacheStats(): { correspondents: number; documentTypes: number; tags: number } {
    return {
      correspondents: this.correspondentCache.size,
      documentTypes: this.documentTypeCache.size,
      tags: this.tagCache.size,
    };
  }

  clearCache(): void {
    this.correspondentCache.clear();
    this.correspondentByNameCache.clear();
    this.documentTypeCache.clear();
    this.tagCache.clear();
    console.log('[Paperless] Cache cleared');
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Token ${this.apiToken}`,
      'Content-Type': 'application/json',
    };
  }

  private async fetchPaperless<T>(endpoint: string): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error('Paperless integration not configured');
    }

    const url = `${this.baseUrl}/api${endpoint}`;
    console.log(`[Paperless] Fetching: ${endpoint}`);
    
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      console.error(`[Paperless] Error: ${response.status} ${response.statusText} (${duration}ms)`);
      throw new Error(`Paperless API error: ${response.status} ${response.statusText}`);
    }

    console.log(`[Paperless] Success: ${endpoint} (${duration}ms)`);
    return response.json() as Promise<T>;
  }

  async checkStatus(): Promise<PaperlessStatusResponse> {
    if (!this.isConfigured()) {
      console.log('[Paperless] Status check: not configured');
      return { configured: false, available: false };
    }

    try {
      // Try to fetch tags as a simple health check
      console.log('[Paperless] Status check: testing connection...');
      await this.fetchPaperless<{ results: PaperlessTag[] }>('/tags/?page_size=1');
      console.log('[Paperless] Status check: available');
      return { configured: true, available: true };
    } catch (error) {
      console.error('[Paperless] Status check: unavailable -', error instanceof Error ? error.message : 'Unknown error');
      return {
        configured: true,
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getTagByName(name: string): Promise<PaperlessTag | null> {
    // Check cache first - but only for positive results (tag found)
    const cached = this.tagCache.get(name);
    if (this.isCacheValid(cached) && cached.data !== null) {
      console.log(`[Paperless] Cache hit: tag "${name}" -> id=${cached.data.id}`);
      return cached.data;
    }

    const response = await this.fetchPaperless<{ results: PaperlessTag[] }>(
      `/tags/?name__iexact=${encodeURIComponent(name)}`
    );
    const tag = response.results.length > 0 ? response.results[0] : null;
    console.log(`[Paperless] Tag lookup: "${name}" -> ${tag ? `found (id=${tag.id})` : 'NOT FOUND (not cached)'}`);
    
    // Only cache positive results - don't cache "not found" so new tags are discovered
    if (tag) {
      this.setCacheEntry(this.tagCache, name, tag);
    }
    return tag;
  }

  async getCorrespondent(id: number): Promise<PaperlessCorrespondent | null> {
    // Check cache first
    const cached = this.correspondentCache.get(id);
    if (this.isCacheValid(cached)) {
      console.log(`[Paperless] Cache hit: correspondent ${id}`);
      return cached.data;
    }

    try {
      const correspondent = await this.fetchPaperless<PaperlessCorrespondent>(`/correspondents/${id}/`);
      this.setCacheEntry(this.correspondentCache, id, correspondent);
      return correspondent;
    } catch {
      return null;
    }
  }

  async getDocumentType(id: number): Promise<PaperlessDocumentType | null> {
    // Check cache first
    const cached = this.documentTypeCache.get(id);
    if (this.isCacheValid(cached)) {
      console.log(`[Paperless] Cache hit: documentType ${id}`);
      return cached.data;
    }

    try {
      const docType = await this.fetchPaperless<PaperlessDocumentType>(`/document_types/${id}/`);
      this.setCacheEntry(this.documentTypeCache, id, docType);
      return docType;
    } catch {
      return null;
    }
  }

  async getDocumentsByTag(tagName: string): Promise<PaperlessDocumentsResponse> {
    // First find the tag by name
    const tag = await this.getTagByName(tagName);
    
    if (!tag) {
      return { count: 0, next: null, previous: null, results: [] };
    }

    // Then fetch documents with that tag
    return this.fetchPaperless<PaperlessDocumentsResponse>(
      `/documents/?tags__id__all=${tag.id}&ordering=-created`
    );
  }

  async getCorrespondentByName(name: string): Promise<PaperlessCorrespondent | null> {
    // Check cache first - but only for positive results (correspondent found)
    const cached = this.correspondentByNameCache.get(name);
    if (this.isCacheValid(cached) && cached.data !== null) {
      console.log(`[Paperless] Cache hit: correspondent "${name}" -> id=${cached.data.id}`);
      return cached.data;
    }

    const response = await this.fetchPaperless<{ results: PaperlessCorrespondent[] }>(
      `/correspondents/?name__iexact=${encodeURIComponent(name)}`
    );
    const correspondent = response.results.length > 0 ? response.results[0] : null;
    console.log(`[Paperless] Correspondent lookup: "${name}" -> ${correspondent ? `found (id=${correspondent.id})` : 'NOT FOUND (not cached)'}`);

    // Only cache positive results so newly-created correspondents are discovered
    if (correspondent) {
      this.setCacheEntry(this.correspondentByNameCache, name, correspondent);
    }
    return correspondent;
  }

  async getDocumentsByCorrespondent(name: string): Promise<PaperlessDocumentsResponse> {
    const correspondent = await this.getCorrespondentByName(name);

    if (!correspondent) {
      return { count: 0, next: null, previous: null, results: [] };
    }

    return this.fetchPaperless<PaperlessDocumentsResponse>(
      `/documents/?correspondent__id=${correspondent.id}&ordering=-created`
    );
  }

  // Generate short tag from contract ID (first 8 chars of UUID)
  private getDefaultTag(contractId: string): string {
    return `c:${contractId.substring(0, 8)}`;
  }

  async getDocumentsForContract(
    contractId: string,
    customTag?: string,
    correspondentName?: string
  ): Promise<ContractDocumentsResponse> {
    const tagName = customTag?.trim() || this.getDefaultTag(contractId);
    const correspondent = correspondentName?.trim() || undefined;
    console.log(
      `[Paperless] Fetching documents for contract: ${contractId} (tag: ${tagName}${customTag ? ' [custom]' : ' [default]'}` +
      `${correspondent ? `, correspondent: ${correspondent}` : ''})`
    );

    // Union of documents matching the tag OR the correspondent. Paperless
    // cannot OR a tag and a correspondent in a single query, so we fetch both
    // and merge/dedupe by document id.
    const [tagResponse, correspondentResponse] = await Promise.all([
      this.getDocumentsByTag(tagName),
      correspondent
        ? this.getDocumentsByCorrespondent(correspondent)
        : Promise.resolve<PaperlessDocumentsResponse>({ count: 0, next: null, previous: null, results: [] }),
    ]);

    const mergedById = new Map<number, PaperlessDocument>();
    for (const doc of [...tagResponse.results, ...correspondentResponse.results]) {
      mergedById.set(doc.id, doc);
    }
    const mergedResults = Array.from(mergedById.values()).sort(
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
    );
    console.log(`[Paperless] Found ${mergedResults.length} documents (tag: ${tagResponse.count}, correspondent: ${correspondentResponse.count})`);

    // Fetch correspondent and document type names for each document
    const documents = await this.enrichDocuments(mergedResults);

    return {
      documents,
      count: mergedResults.length,
      tagName,
      correspondentName: correspondent || null,
    };
  }

  /**
   * Enrich raw Paperless documents with human-readable correspondent and
   * document-type names (via the cached metadata lookups) and build the
   * user-facing / download URLs.
   */
  private async enrichDocuments(docs: PaperlessDocument[]): Promise<ContractDocument[]> {
    return Promise.all(
      docs.map(async (doc) => {
        let correspondentName: string | null = null;
        let documentTypeName: string | null = null;

        if (doc.correspondent) {
          const correspondentObj = await this.getCorrespondent(doc.correspondent);
          correspondentName = correspondentObj?.name || null;
        }

        if (doc.document_type) {
          const docType = await this.getDocumentType(doc.document_type);
          documentTypeName = docType?.name || null;
        }

        return {
          id: doc.id,
          title: doc.title,
          created: doc.created,
          correspondent: correspondentName,
          documentType: documentTypeName,
          paperlessUrl: `${this.publicUrl}/documents/${doc.id}/details`,
          downloadUrl: `${this.baseUrl}/api/documents/${doc.id}/download/`,
        };
      })
    );
  }

  /**
   * Full-text search across Paperless (title + OCR content index) via the
   * `query` parameter. Results are ordered by Paperless relevance.
   */
  async searchDocuments(query: string): Promise<PaperlessDocumentsResponse> {
    const trimmed = query.trim();
    if (!trimmed) {
      return { count: 0, next: null, previous: null, results: [] };
    }
    return this.fetchPaperless<PaperlessDocumentsResponse>(
      `/documents/?query=${encodeURIComponent(trimmed)}`
    );
  }

  /**
   * Build a de-duplicated list of search terms from a contract's company and
   * name. Short (<=2 char) tokens are dropped to reduce noise.
   */
  private buildDiscoveryTerms(name?: string, company?: string): string[] {
    const raw = `${company || ''} ${name || ''}`.toLowerCase();
    const seen = new Set<string>();
    const terms: string[] = [];
    for (const token of raw.split(/[^\p{L}\p{N}]+/u)) {
      if (token.length > 2 && !seen.has(token)) {
        seen.add(token);
        terms.push(token);
      }
    }
    return terms;
  }

  /**
   * Discover Paperless documents that likely relate to a contract but are NOT
   * already linked by the exact tag/correspondent read.
   *
   * Strategy (read-only, one search request):
   *   1. Full-text search Paperless using the contract's company + name terms.
   *   2. Determine which documents are already linked (exact tag/correspondent).
   *   3. Exclude already-linked docs, score the rest by how many query terms
   *      appear in the title/correspondent, sort by score then recency, cap N.
   */
  async discoverDocumentsForContract(
    contractId: string,
    name?: string,
    company?: string,
    customTag?: string,
    correspondentName?: string,
    limit: number = 10
  ): Promise<ContractDocumentsDiscoveryResponse> {
    const terms = this.buildDiscoveryTerms(name, company);
    const query = terms.join(' ');
    console.log(
      `[Paperless] Discovering documents for contract ${contractId} (query: "${query}")`
    );

    if (!query) {
      return { suggestions: [], count: 0, query: '', excludedCount: 0 };
    }

    // Run the full-text search and, in parallel, find the already-linked docs
    // so we can exclude them from the suggestions.
    const [searchResponse, linked] = await Promise.all([
      this.searchDocuments(query),
      this.getDocumentsForContract(contractId, customTag, correspondentName).catch(() => ({
        documents: [] as ContractDocument[],
      })),
    ]);

    const linkedIds = new Set(linked.documents.map((d) => d.id));
    const candidates = searchResponse.results.filter((doc) => !linkedIds.has(doc.id));
    const excludedCount = searchResponse.results.length - candidates.length;

    // Enrich, then score by how many query terms appear in title/correspondent.
    const enriched = await this.enrichDocuments(candidates);
    const suggestions: DiscoverySuggestion[] = enriched
      .map((doc) => {
        const haystack = `${doc.title} ${doc.correspondent || ''}`.toLowerCase();
        const score = terms.reduce((acc, term) => (haystack.includes(term) ? acc + 1 : acc), 0);
        return { ...doc, score };
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(b.created).getTime() - new Date(a.created).getTime();
      })
      .slice(0, limit);

    console.log(
      `[Paperless] Discovery for ${contractId}: ${searchResponse.results.length} hits, ` +
      `${excludedCount} already-linked, ${suggestions.length} suggestions`
    );

    return {
      suggestions,
      count: suggestions.length,
      query,
      excludedCount,
    };
  }
}

export const paperlessService = new PaperlessService();
