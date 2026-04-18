// client/src/services/paperlessApi.ts

import { loadConfig } from './config';

let API_BASE = 'http://localhost:3001/api';
let configLoaded = false;

const ensureConfigLoaded = async () => {
  if (!configLoaded) {
    try {
      const config = await loadConfig();
      API_BASE = config.API_URL;
    } catch (error) {
      console.warn('Failed to load config, using default API URL');
    }
    configLoaded = true;
  }
};

export interface PaperlessDocument {
  id: number;
  title: string;
  created: string;
  correspondent: string | null;
  documentType: string | null;
  paperlessUrl: string;
  downloadUrl: string;
}

export interface PaperlessDocumentsResponse {
  documents: PaperlessDocument[];
  count: number;
  tagName: string;
}

export interface PaperlessStatusResponse {
  configured: boolean;
  available: boolean;
  error?: string;
}

export const paperlessApi = {
  async getStatus(): Promise<PaperlessStatusResponse> {
    await ensureConfigLoaded();
    try {
      const response = await fetch(`${API_BASE}/paperless/status`);
      if (!response.ok) {
        return { configured: false, available: false };
      }
      return response.json();
    } catch (error) {
      return { configured: false, available: false };
    }
  },

  async getDocuments(contractId: string): Promise<PaperlessDocumentsResponse> {
    await ensureConfigLoaded();
    const response = await fetch(`${API_BASE}/paperless/documents/${contractId}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch documents' }));
      throw new Error(error.error || 'Failed to fetch documents');
    }
    return response.json();
  },
};
