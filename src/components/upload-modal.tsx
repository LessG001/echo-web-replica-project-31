
import { useState, useRef } from "react";
import { X, Upload, File } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, encrypt: boolean) => void;
}

export function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [encrypt, setEncrypt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile, encrypt);
      onClose();
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card p-0 border-border/40">
        <div className="flex flex-col p-6">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-semibold">Upload File</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-muted-foreground mb-6">Upload a new file to your secure vault</p>
          
          {!selectedFile ? (
            <div 
              className="border-2 border-dashed border-border/60 rounded-lg p-8 text-center flex flex-col items-center justify-center gap-4"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="bg-secondary rounded-full p-4">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-1">Upload File</h3>
                <p className="text-muted-foreground text-sm">Drag and drop your file here, or click to browse</p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleBrowseClick}
                className="mt-2"
              >
                Browse Files
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </div>
          ) : (
            <div className="border border-border/60 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <File className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleRemoveFile} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium">Encrypt file</span>
                <Switch 
                  checked={encrypt} 
                  onCheckedChange={setEncrypt} 
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              disabled={!selectedFile} 
              onClick={handleUpload}
              className={cn(!selectedFile && "opacity-50 cursor-not-allowed")}
            >
              Upload
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
