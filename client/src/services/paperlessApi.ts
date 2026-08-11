// client/src/services/paperlessApi.ts

import { loadConfig } from './config';
import { smartApi } from './smartApi';
import { notifyUnauthorized } from './authEvents';

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
  correspondentName?: string | null;
}

export interface PaperlessStatusResponse {
  configured: boolean;
  available: boolean;
  error?: string;
}

// Demo documents for specific contracts
const demoDocuments: Record<string, PaperlessDocument[]> = {
  'demo-netflix': [
    {
      id: 1001,
      title: 'Netflix Subscription Confirmation',
      created: '2024-01-01',
      correspondent: 'Netflix, Inc.',
      documentType: 'Confirmation',
      paperlessUrl: '#demo',
      downloadUrl: '#demo',
    },
    {
      id: 1002,
      title: 'Netflix Price Change Notice',
      created: '2024-06-15',
      correspondent: 'Netflix, Inc.',
      documentType: 'Notice',
      paperlessUrl: '#demo',
      downloadUrl: '#demo',
    },
  ],
  'demo-insurance': [
    {
      id: 2001,
      title: 'Home Insurance Policy 2024',
      created: '2024-01-15',
      correspondent: 'State Farm',
      documentType: 'Policy',
      paperlessUrl: '#demo',
      downloadUrl: '#demo',
    },
    {
      id: 2002,
      title: 'Coverage Summary',
      created: '2024-01-15',
      correspondent: 'State Farm',
      documentType: 'Summary',
      paperlessUrl: '#demo',
      downloadUrl: '#demo',
    },
    {
      id: 2003,
      title: 'Premium Invoice Q1 2024',
      created: '2024-03-01',
      correspondent: 'State Farm',
      documentType: 'Invoice',
      paperlessUrl: '#demo',
      downloadUrl: '#demo',
    },
  ],
  'demo-electricity': [
    {
      id: 3001,
      title: 'Electricity Contract',
      created: '2023-06-01',
      correspondent: 'Pacific Gas & Electric',
      documentType: 'Contract',
      paperlessUrl: '#demo',
      downloadUrl: '#demo',
    },
  ],
};

export const paperlessApi = {
  async getStatus(): Promise<PaperlessStatusResponse> {
    // In demo mode, pretend Paperless is configured and available
    const isDemoMode = await smartApi.isDemoMode();
    if (isDemoMode) {
      return { configured: true, available: true };
    }

    await ensureConfigLoaded();
    try {
      const response = await fetch(`${API_BASE}/paperless/status`, { credentials: 'include' });
      if (response.status === 401) {
        notifyUnauthorized();
        return { configured: false, available: false };
      }
      if (!response.ok) {
        return { configured: false, available: false };
      }
      return response.json();
    } catch (error) {
      return { configured: false, available: false };
    }
  },

  async getDocuments(contractId: string, customTag?: string, correspondent?: string): Promise<PaperlessDocumentsResponse> {
    const effectiveTag = customTag?.trim() || `c:${contractId.substring(0, 8)}`;
    
    // In demo mode, return fake documents
    const isDemoMode = await smartApi.isDemoMode();
    if (isDemoMode) {
      const documents = demoDocuments[contractId] || [];
      return {
        documents,
        count: documents.length,
        tagName: effectiveTag,
        correspondentName: correspondent?.trim() || null,
      };
    }

    await ensureConfigLoaded();
    const params = new URLSearchParams();
    if (customTag?.trim()) {
      params.set('tag', customTag.trim());
    }
    if (correspondent?.trim()) {
      params.set('correspondent', correspondent.trim());
    }
    const query = params.toString();
    const url = query
      ? `${API_BASE}/paperless/documents/${contractId}?${query}`
      : `${API_BASE}/paperless/documents/${contractId}`;
    const response = await fetch(url, { credentials: 'include' });
    if (response.status === 401) {
      notifyUnauthorized();
      throw new Error('Authentication required');
    }
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch documents' }));
      throw new Error(error.error || 'Failed to fetch documents');
    }
    return response.json();
  },
};
