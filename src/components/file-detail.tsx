
import { useState } from "react";
import { FileIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { NavIcons } from "@/components/ui/icons";
import { Lock, Download, Share2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EncryptionData {
  algorithm: string;
  encryptionKey: string;
  iv: string;
}

interface FileDetailProps {
  file: {
    id: string;
    name: string;
    extension: string;
    size: string;
    type: string;
    created: string;
    modified: string;
    createdBy: string;
    modifiedBy: string;
    isEncrypted: boolean;
    checksum?: string;
    encryptionData?: EncryptionData;
  };
  onDownload: () => void;
  onShare: () => void;
  onDelete: () => void;
}

export function FileDetail({ file, onDownload, onShare, onDelete }: FileDetailProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const handleCopyKey = () => {
    if (file.encryptionData) {
      navigator.clipboard.writeText(file.encryptionData.encryptionKey);
      toast({
        description: "Encryption key copied to clipboard",
      });
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">{file.name}</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={onDownload} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={onShare} className="w-full sm:w-auto">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-destructive w-full sm:w-auto" 
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      <div className="bg-card rounded-lg border border-border/40 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-6">
          <div className="flex justify-center sm:justify-start">
            <FileIcon extension={file.extension} size={64} className="mb-4 sm:mb-0" />
          </div>
          <div>
            <h3 className="text-lg font-medium">{file.name}</h3>
            <p className="text-sm text-muted-foreground">{file.size}</p>
            {file.isEncrypted && (
              <div className="flex items-center mt-2">
                <Lock className="h-4 w-4 text-primary mr-1" />
                <span className="text-sm font-medium text-primary">Encrypted</span>
              </div>
            )}
          </div>
        </div>
        
        <h3 className="text-lg font-medium mb-4">File Information</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Type:</p>
              <p className="font-medium">{file.type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Size:</p>
              <p className="font-medium">{file.size}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Created:</p>
              <p className="font-medium">{file.created}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Modified:</p>
              <p className="font-medium">{file.modified}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Created By:</p>
              <p className="font-medium">{file.createdBy}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Modified By:</p>
              <p className="font-medium">{file.modifiedBy}</p>
            </div>
          </div>
          
          <div className="pt-4 mt-4 border-t border-border/40">
            <h4 className="text-md font-medium mb-4">Security</h4>
            
            {file.isEncrypted && (
              <div className="bg-secondary/50 rounded-lg p-4 flex items-center">
                <Lock className="h-5 w-5 text-primary mr-3" />
                <div>
                  <p className="font-medium">This file is encrypted</p>
                  <p className="text-sm text-muted-foreground">Only authorized users can view the contents</p>
                </div>
              </div>
            )}
            
            {file.isEncrypted && file.encryptionData && (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Encryption Algorithm:</p>
                  <p className="font-mono text-sm bg-secondary/40 p-2 rounded">{file.encryptionData.algorithm}</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-muted-foreground">Encryption Key:</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 py-0 px-2"
                      onClick={handleCopyKey}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="font-mono text-xs bg-secondary/40 p-2 rounded overflow-auto max-h-20">
                    {file.encryptionData.encryptionKey}
                  </p>
                </div>
              </div>
            )}
            
            {file.checksum && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-1">Checksum (SHA-256):</p>
                <p className="text-xs font-mono bg-secondary/40 p-2 rounded overflow-auto">{file.checksum}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this file?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {file.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
