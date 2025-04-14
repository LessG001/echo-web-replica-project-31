
import { useState } from "react";
import { FileIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { NavIcons } from "@/components/ui/icons";
import { Lock } from "lucide-react";
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
  
  const handleDownload = () => {
    onDownload();
  };
  
  const handleShare = () => {
    onShare();
  };
  
  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    onDelete();
    setDeleteDialogOpen(false);
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{file.name}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <NavIcons.Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <NavIcons.Shared className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="icon" className="text-destructive" onClick={handleDelete}>
            <NavIcons.Delete className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="bg-card rounded-lg border border-border/40 p-6">
        <div className="flex items-center mb-6">
          <div className="mr-6">
            <FileIcon extension={file.extension} size={64} className="mb-4" />
          </div>
          <div>
            <h3 className="text-lg font-medium">{file.name}</h3>
            <p className="text-sm text-muted-foreground">{file.size}</p>
          </div>
        </div>
        
        <h3 className="text-lg font-medium mb-4">File Information</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Type:</p>
              <p className="font-medium">{file.type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Size:</p>
              <p className="font-medium">{file.size}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Created:</p>
              <p className="font-medium">{file.created}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Modified:</p>
              <p className="font-medium">{file.modified}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this file?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {file.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
