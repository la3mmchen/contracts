// api/src/types/paperless.ts

export interface PaperlessDocument {
  id: number;
  title: string;
  created: string;
  correspondent: number | null;
  document_type: number | null;
  added: string;
  original_file_name: string;
}

export interface PaperlessCorrespondent {
  id: number;
  name: string;
}

export interface PaperlessDocumentType {
  id: number;
  name: string;
}

export interface PaperlessTag {
  id: number;
  name: string;
}

export interface PaperlessDocumentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PaperlessDocument[];
}

export interface PaperlessStatusResponse {
  configured: boolean;
  available: boolean;
  error?: string;
}

export interface ContractDocument {
  id: number;
  title: string;
  created: string;
  correspondent: string | null;
  documentType: string | null;
  paperlessUrl: string;
  downloadUrl: string;
}

export interface ContractDocumentsResponse {
  documents: ContractDocument[];
  count: number;
  tagName: string;
  correspondentName?: string | null;
}

// A discovered document is a normal ContractDocument plus a lightweight
// relevance score indicating how many of the query terms matched its
// title/correspondent. Used only for the read-only discovery suggestions.
export interface DiscoverySuggestion extends ContractDocument {
  score: number;
}

export interface ContractDocumentsDiscoveryResponse {
  suggestions: DiscoverySuggestion[];
  count: number;
  // The full-text query that was sent to Paperless.
  query: string;
  // Number of full-text hits that were dropped because they were already
  // linked to the contract via the exact tag/correspondent read.
  excludedCount: number;
}
