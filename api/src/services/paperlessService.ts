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
} from '../types/paperless';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class PaperlessService {
  private baseUrl: string | undefined;
  private apiToken: string | undefined;
  
  // Cache for metadata (correspondents, document types, tags)
  private correspondentCache: Map<number, CacheEntry<PaperlessCorrespondent>> = new Map();
  private documentTypeCache: Map<number, CacheEntry<PaperlessDocumentType>> = new Map();
  private tagCache: Map<string, CacheEntry<PaperlessTag | null>> = new Map();
  
  // Cache TTL in milliseconds (default: 5 minutes)
  private readonly CACHE_TTL = 5 * 60 * 1000;

  constructor() {
    this.baseUrl = process.env.PAPERLESS_URL;
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
    // Check cache first
    const cached = this.tagCache.get(name);
    if (this.isCacheValid(cached)) {
      console.log(`[Paperless] Cache hit: tag "${name}" -> ${cached.data ? `id=${cached.data.id}` : 'null'}`);
      return cached.data;
    }

    const response = await this.fetchPaperless<{ results: PaperlessTag[] }>(
      `/tags/?name__iexact=${encodeURIComponent(name)}`
    );
    const tag = response.results.length > 0 ? response.results[0] : null;
    console.log(`[Paperless] Tag lookup: "${name}" -> ${tag ? `found (id=${tag.id})` : 'NOT FOUND'}`);
    
    this.setCacheEntry(this.tagCache, name, tag);
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

  // Generate short tag from contract ID (first 8 chars of UUID)
  private getShortTag(contractId: string): string {
    return `c:${contractId.substring(0, 8)}`;
  }

  async getDocumentsForContract(contractId: string): Promise<ContractDocumentsResponse> {
    const tagName = this.getShortTag(contractId);
    console.log(`[Paperless] Fetching documents for contract: ${contractId} (tag: ${tagName})`);
    
    const response = await this.getDocumentsByTag(tagName);
    console.log(`[Paperless] Found ${response.count} documents for tag: ${tagName}`);

    // Fetch correspondent and document type names for each document
    const documents: ContractDocument[] = await Promise.all(
      response.results.map(async (doc) => {
        let correspondentName: string | null = null;
        let documentTypeName: string | null = null;

        if (doc.correspondent) {
          const correspondent = await this.getCorrespondent(doc.correspondent);
          correspondentName = correspondent?.name || null;
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
          paperlessUrl: `${this.baseUrl}/documents/${doc.id}/details`,
          downloadUrl: `${this.baseUrl}/api/documents/${doc.id}/download/`,
        };
      })
    );

    return {
      documents,
      count: response.count,
      tagName,
    };
  }
}

export const paperlessService = new PaperlessService();
