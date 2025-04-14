
import { useState, useRef } from "react";
import { X, Upload, File, Key, Lock, Unlock } from "lucide-react";
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
  const [iv, setIv] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEncryptedFile(e.target.files[0]);
      setDecryptedFile(null);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setEncryptedFile(e.dataTransfer.files[0]);
      setDecryptedFile(null);
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleDecrypt = async () => {
    if (!encryptedFile || !encryptionKey || !iv) {
      toast({
        title: "Missing information",
        description: "Please provide the encrypted file, encryption key, and IV",
        variant: "destructive",
      });
      return;
    }
    
    setIsDecrypting(true);
    
    try {
      const decrypted = await decryptFile(encryptedFile, encryptionKey, iv);
      setDecryptedFile(decrypted);
      
      toast({
        title: "File decrypted",
        description: `${encryptedFile.name} has been successfully decrypted`,
      });
    } catch (error) {
      console.error("Decryption failed:", error);
      toast({
        title: "Decryption failed",
        description: "Invalid encryption key or IV, or the file is not encrypted",
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
    setIv("");
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
                        {(encryptedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleRemoveFile} className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
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
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="iv">Initialization Vector (IV)</Label>
                    <Input
                      id="iv"
                      value={iv}
                      onChange={(e) => setIv(e.target.value)}
                      placeholder="Paste the IV here"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleDecrypt} 
                  disabled={!encryptedFile || !encryptionKey || !iv || isDecrypting}
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
                    <Button onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Decrypted File
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
