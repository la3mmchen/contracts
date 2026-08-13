// client/src/hooks/usePaperlessDocuments.ts

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  paperlessApi,
  PaperlessDocumentsResponse,
  PaperlessStatusResponse,
  PaperlessDiscoveryResponse,
} from '@/services/paperlessApi';

export const usePaperlessStatus = () => {
  return useQuery<PaperlessStatusResponse>({
    queryKey: ['paperless', 'status'],
    queryFn: () => paperlessApi.getStatus(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
};

export const usePaperlessDocuments = (contractId: string | undefined, customTag?: string, correspondent?: string) => {
  const statusQuery = usePaperlessStatus();

  const documentsQuery = useQuery<PaperlessDocumentsResponse>({
    queryKey: ['paperless', 'documents', contractId, customTag, correspondent],
    queryFn: () => paperlessApi.getDocuments(contractId!, customTag, correspondent),
    enabled: !!contractId && statusQuery.data?.configured && statusQuery.data?.available,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });

  return {
    status: statusQuery.data,
    statusLoading: statusQuery.isLoading,
    documents: documentsQuery.data?.documents || [],
    documentsLoading: documentsQuery.isLoading,
    documentsError: documentsQuery.error,
    tagName: documentsQuery.data?.tagName,
    correspondentName: documentsQuery.data?.correspondentName,
    refetch: documentsQuery.refetch,
    isConfigured: statusQuery.data?.configured ?? false,
    isAvailable: statusQuery.data?.available ?? false,
  };
};

interface DiscoveryArgs {
  contractId: string;
  name?: string;
  company?: string;
  customTag?: string;
  correspondent?: string;
}

/**
 * On-demand discovery of likely-related Paperless documents. Triggered by a
 * user action (button click) via `discover(...)`, so it uses a mutation rather
 * than an auto-running query.
 */
export const usePaperlessDiscovery = () => {
  const mutation = useMutation<PaperlessDiscoveryResponse, Error, DiscoveryArgs>({
    mutationFn: ({ contractId, name, company, customTag, correspondent }) =>
      paperlessApi.discoverDocuments(contractId, name, company, customTag, correspondent),
  });

  return {
    discover: mutation.mutate,
    reset: mutation.reset,
    result: mutation.data,
    suggestions: mutation.data?.suggestions || [],
    isLoading: mutation.isPending,
    error: mutation.error,
    hasRun: mutation.isSuccess || mutation.isError,
  };
};
