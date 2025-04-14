
import { useState, useRef } from "react";
import { X, Upload, File, Key, Lock, Unlock, Download } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { decryptFile, downloadFile } from "@/utils/encryption";
import { FilePreview } from "@/components/file-preview";
import { useToast } from "@/hooks/use-toast";

interface DecryptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DecryptionModal({ isOpen, onClose }: DecryptionModalProps) {
  const [encryptedFile, setEncryptedFile] = useState<File | null>(null);
  const [decryptedFile, setDecryptedFile] = useState<File | null>(null);
  const [encryptionKey, setEncryptionKey] = useState("");
  const [fileDetails, setFileDetails] = useState<{
    type: string;
    size: string;
    lastModified: string;
  } | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEncryptedFile(file);
      setDecryptedFile(null);
      
      // Set file details
      setFileDetails({
        type: file.type || 'Unknown',
        size: formatFileSize(file.size),
        lastModified: new Date(file.lastModified).toLocaleString()
      });
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setEncryptedFile(file);
      setDecryptedFile(null);
      
      // Set file details
      setFileDetails({
        type: file.type || 'Unknown',
        size: formatFileSize(file.size),
        lastModified: new Date(file.lastModified).toLocaleString()
      });
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
  
  const handleRemoveFile = () => {
    setEncryptedFile(null);
    setDecryptedFile(null);
    setFileDetails(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleDecrypt = async () => {
    if (!encryptedFile || !encryptionKey) {
      toast({
        title: "Missing information",
        description: "Please provide the encrypted file and encryption key",
        variant: "destructive",
      });
      return;
    }
    
    setIsDecrypting(true);
    
    try {
      // For simplicity, extract IV from the key (last part)
      const parts = encryptionKey.split('.');
      let iv = '';
      let actualKey = encryptionKey;
      
      if (parts.length > 1) {
        // Last part is the IV
        iv = parts[parts.length - 1];
        // The rest is the key
        actualKey = parts.slice(0, -1).join('.');
      } else {
        toast({
          title: "Invalid key format",
          description: "The encryption key doesn't contain the initialization vector",
          variant: "destructive",
        });
        setIsDecrypting(false);
        return;
      }
      
      const decrypted = await decryptFile(encryptedFile, actualKey, iv);
      setDecryptedFile(decrypted);
      
      toast({
        title: "File decrypted",
        description: `${encryptedFile.name} has been successfully decrypted`,
      });
    } catch (error) {
      console.error("Decryption failed:", error);
      toast({
        title: "Decryption failed",
        description: "Invalid encryption key or the file is not encrypted",
        variant: "destructive",
      });
    } finally {
      setIsDecrypting(false);
    }
  };
  
  const handleDownload = () => {
    if (decryptedFile) {
      downloadFile(decryptedFile);
      toast({
        title: "Download started",
        description: `${decryptedFile.name} is being downloaded`,
      });
    }
  };
  
  const handleClose = () => {
    setEncryptedFile(null);
    setDecryptedFile(null);
    setEncryptionKey("");
    setFileDetails(null);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-xl bg-card p-0 border-border/40">
        <div className="flex flex-col p-6">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-semibold">Decrypt File</DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-muted-foreground mb-6">Upload an encrypted file and provide the decryption key</p>
          
          {!encryptedFile ? (
            <div 
              className="border-2 border-dashed border-border/60 rounded-lg p-8 text-center flex flex-col items-center justify-center gap-4"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="bg-secondary rounded-full p-4">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-1">Upload Encrypted File</h3>
                <p className="text-muted-foreground text-sm">Drag and drop your encrypted file here, or click to browse</p>
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
            <div className="space-y-6">
              <div className="border border-border/60 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Lock className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-medium">{encryptedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {fileDetails?.size}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleRemoveFile} className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {fileDetails && (
                  <div className="mt-4 pt-4 border-t border-border/40">
                    <h4 className="text-sm font-medium mb-2">File Details</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span>{fileDetails.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span>{fileDetails.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Modified:</span>
                        <span>{fileDetails.lastModified}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="encryptionKey">Encryption Key</Label>
                    <Input
                      id="encryptionKey"
                      value={encryptionKey}
                      onChange={(e) => setEncryptionKey(e.target.value)}
                      placeholder="Paste the encryption key here"
                    />
                    <p className="text-xs text-muted-foreground">
                      Paste the complete encryption key you received when encrypting the file
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={handleDecrypt} 
                  disabled={!encryptedFile || !encryptionKey || isDecrypting}
                  className="w-full"
                >
                  {isDecrypting ? (
                    <>
                      <Lock className="h-4 w-4 mr-2 animate-spin" />
                      Decrypting...
                    </>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4 mr-2" />
                      Decrypt File
                    </>
                  )}
                </Button>
              </div>
              
              {decryptedFile && (
                <div className="mt-6">
                  <div className="bg-secondary/50 rounded-lg p-4 mb-4 flex items-center">
                    <Unlock className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <p className="font-medium">File successfully decrypted</p>
                      <p className="text-sm text-muted-foreground">
                        Original file: {decryptedFile.name} ({(decryptedFile.size / 1024).toFixed(2)} KB)
                      </p>
                    </div>
                  </div>
                  
                  <FilePreview 
                    file={decryptedFile} 
                    onDownload={handleDownload} 
                  />
                  
                  <div className="flex justify-end mt-4">
                    <Button onClick={handleDownload} className="w-64">
                      <Download className="h-4 w-4 mr-2" />
                      Download Decrypted File
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={handleClose} className="w-24">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
