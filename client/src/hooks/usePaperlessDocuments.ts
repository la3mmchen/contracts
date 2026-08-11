// client/src/hooks/usePaperlessDocuments.ts

import { useQuery } from '@tanstack/react-query';
import { paperlessApi, PaperlessDocumentsResponse, PaperlessStatusResponse } from '@/services/paperlessApi';

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
