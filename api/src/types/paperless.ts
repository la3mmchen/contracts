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
}
