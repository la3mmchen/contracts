import React, { useState } from 'react';
import { Contract, NotesHistoryEntry } from '@/types/contract';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Clock, Edit, Save, X, History } from 'lucide-react';
import { format } from 'date-fns';

interface NotesSectionProps {
  contract: Contract;
  onUpdate: (id: string, updates: Partial<Contract>) => Promise<void>;
}

export const NotesSection: React.FC<NotesSectionProps> = ({ contract, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingNotes, setEditingNotes] = useState(contract.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (editingNotes.trim() !== (contract.notes || '')) {
      setIsSaving(true);
      try {
        await onUpdate(contract.id, { notes: editingNotes.trim() });
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to update notes:', error);
        setEditingNotes(contract.notes || '');
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditingNotes(contract.notes || '');
    setIsEditing(false);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'MMM d, yyyy HH:mm');
    } catch {
      return timestamp;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Notes
          {!isEditing && (
            <div className="flex items-center gap-2 ml-auto">
              {contract.notes && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to clear all notes? This action cannot be undone.')) {
                      try {
                        await onUpdate(contract.id, { notes: '' });
                      } catch (error) {
                        console.error('Failed to clear notes:', error);
                      }
                    }
                  }}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Clear notes"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Edit 
                className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" 
                onClick={() => setIsEditing(true)}
              />
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={editingNotes}
              onChange={(e) => setEditingNotes(e.target.value)}
              placeholder="Enter notes about this contract..."
              className="min-h-[100px] resize-none"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingNotes('')}
                disabled={isSaving}
                className="px-3"
                title="Clear notes"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div 
              className="min-h-[100px] p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setIsEditing(true)}
              title="Click to edit notes"
            >
              {contract.notes ? (
                <div className="whitespace-pre-wrap leading-relaxed text-foreground">
                  {contract.notes}
                </div>
              ) : (
                <div className="text-muted-foreground italic">
                  Click to add notes...
                </div>
              )}
            </div>
            
            {/* Notes History */}
            {contract.notesHistory && contract.notesHistory.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <History className="h-4 w-4" />
                  <span>History</span>
                  <Badge variant="secondary" className="text-xs">
                    {contract.notesHistory.length}
                  </Badge>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {contract.notesHistory.slice(-5).reverse().map((entry: NotesHistoryEntry, index: number) => (
                    <div key={index} className="text-xs bg-muted/20 p-2 rounded border-l-2 border-primary/30">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-muted-foreground">
                          {formatTimestamp(entry.timestamp)}
                        </span>
                        {!entry.notes && (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            Empty
                          </Badge>
                        )}
                      </div>
                      <div className="text-foreground whitespace-pre-wrap line-clamp-3">
                        {entry.notes ? (
                          entry.notes
                        ) : (
                          <span className="text-muted-foreground italic">
                            Notes were cleared
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {contract.notesHistory.length > 5 && (
                  <div className="text-xs text-muted-foreground text-center">
                    Showing last 5 of {contract.notesHistory.length} entries
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
