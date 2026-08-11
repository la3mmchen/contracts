// client/src/components/PaperlessDocuments.tsx

import React from 'react';
import { usePaperlessDocuments } from '@/hooks/usePaperlessDocuments';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  ExternalLink,
  Loader2,
  AlertCircle,
  FolderOpen,
  RefreshCw,
  Copy,
} from 'lucide-react';

interface PaperlessDocumentsProps {
  contractId: string;
  paperlessTag?: string; // Custom tag, falls back to c:<short-uuid> if not set
  paperlessCorrespondent?: string; // Also match documents by this Paperless correspondent
}

export const PaperlessDocuments: React.FC<PaperlessDocumentsProps> = ({ contractId, paperlessTag: customTag, paperlessCorrespondent: correspondent }) => {
  const { toast } = useToast();
  const {
    documents,
    documentsLoading,
    documentsError,
    tagName,
    correspondentName,
    refetch,
    isConfigured,
    isAvailable,
    statusLoading,
  } = usePaperlessDocuments(contractId, customTag, correspondent);

  const paperlessTag = tagName || customTag?.trim() || `c:${contractId.substring(0, 8)}`;
  const paperlessCorrespondent = correspondentName ?? correspondent?.trim() ?? null;

  const copyTagToClipboard = () => {
    navigator.clipboard.writeText(paperlessTag);
    toast({
      title: "Tag copied!",
      description: `"${paperlessTag}" copied to clipboard`,
    });
  };

  // Don't render if Paperless is not configured
  if (!statusLoading && !isConfigured) {
    return null;
  }

  // Loading state for status check
  if (statusLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Header description showing the copyable tag (and correspondent, if set).
  // Shared between the available and unavailable states so the tag can always
  // be copied even when the Paperless service is unreachable.
  const searchCriteria = (
    <CardDescription className="flex flex-wrap items-center gap-2 mt-1">
      <span className="text-xs">Paperless tag:</span>
      <code
        className="text-xs bg-muted px-2 py-0.5 rounded font-mono cursor-pointer hover:bg-muted/80 transition-colors flex items-center gap-1"
        onClick={copyTagToClipboard}
        title="Click to copy"
      >
        {paperlessTag}
        <Copy className="h-3 w-3" />
      </code>
      {paperlessCorrespondent && (
        <>
          <span className="text-xs">correspondent:</span>
          <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
            {paperlessCorrespondent}
          </code>
        </>
      )}
    </CardDescription>
  );

  // Paperless unavailable
  if (!isAvailable) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents
          </CardTitle>
          {searchCriteria}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <AlertCircle className="h-8 w-8 text-amber-500" />
            <p className="text-sm text-muted-foreground">
              Document service unavailable
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documents
          {documents.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {documents.length}
            </Badge>
          )}
        </CardTitle>
        {searchCriteria}
      </CardHeader>
      <CardContent>
        {/* Loading state */}
        {documentsLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error state */}
        {documentsError && !documentsLoading && (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-muted-foreground">
              Failed to load documents
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!documentsLoading && !documentsError && documents.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <FolderOpen className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No documents linked
            </p>
            <p className="text-xs text-muted-foreground">
              Add the tag above to documents in Paperless to link them here
            </p>
          </div>
        )}

        {/* Documents list */}
        {!documentsLoading && !documentsError && documents.length > 0 && (
          <div className="space-y-2">
            {documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.paperlessUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" title={doc.title}>
                    {doc.title}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-0.5 text-xs text-muted-foreground">
                    <span>{new Date(doc.created).toLocaleDateString()}</span>
                    {doc.correspondent && <span>{doc.correspondent}</span>}
                    {doc.documentType && (
                      <Badge variant="outline" className="text-xs py-0">
                        {doc.documentType}
                      </Badge>
                    )}
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
