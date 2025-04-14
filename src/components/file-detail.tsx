
import { useState } from "react";
import { FileIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { NavIcons } from "@/components/ui/icons";
import { Lock } from "lucide-react";

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
  };
  onDownload: () => void;
  onShare: () => void;
  onDelete: () => void;
}

export function FileDetail({ file, onDownload, onShare, onDelete }: FileDetailProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{file.name}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onDownload}>
            <NavIcons.Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={onShare}>
            <NavIcons.Shared className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="icon" className="text-destructive">
            <NavIcons.Delete className="h-4 w-4" onClick={onDelete} />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border/40 flex items-center justify-center p-12">
          <div className="flex flex-col items-center">
            <FileIcon extension={file.extension} size={96} className="mb-4" />
            <h3 className="text-lg font-medium">{file.name}</h3>
            <p className="text-sm text-muted-foreground">{file.size}</p>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border border-border/40 p-6">
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
                  <p className="text-sm text-muted-foreground mb-1">Checksum:</p>
                  <p className="text-xs font-mono bg-secondary/40 p-2 rounded overflow-auto">{file.checksum}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
