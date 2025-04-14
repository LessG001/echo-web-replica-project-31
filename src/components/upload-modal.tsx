
import { useState, useRef, useEffect } from "react";
import { X, Upload, File, Lock, Key } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FilePreview } from "@/components/file-preview";
import { cn } from "@/lib/utils";
import { encryptFile, calculateChecksum } from "@/utils/encryption";
import { useToast } from "@/hooks/use-toast";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (fileData: UploadFileData) => void;
}

export interface UploadFileData {
  file: File;
  originalFile?: File;
  encrypt: boolean;
  encryptionData?: {
    algorithm: string;
    encryptionKey: string;
    iv: string;
    checksum: string;
  };
}

export function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [encrypt, setEncrypt] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptedFile, setEncryptedFile] = useState<File | null>(null);
  const [encryptionData, setEncryptionData] = useState<{
    algorithm: string;
    encryptionKey: string;
    iv: string;
    checksum: string;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setEncryptedFile(null);
      setEncryptionData(null);
      setEncrypt(false);
      setIsEncrypting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setEncryptedFile(null);
      setEncryptionData(null);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setEncryptedFile(null);
      setEncryptionData(null);
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
  
  const handleEncrypt = async () => {
    if (!selectedFile) return;
    
    setIsEncrypting(true);
    
    try {
      // Calculate checksum of original file
      const checksum = await calculateChecksum(selectedFile);
      
      // Encrypt the file
      const { encryptedFile: encrypted, algorithm, encryptionKey, iv } = await encryptFile(selectedFile);
      
      setEncryptedFile(encrypted);
      setEncryptionData({
        algorithm,
        encryptionKey,
        iv,
        checksum
      });
      
      toast({
        title: "File encrypted",
        description: `${selectedFile.name} has been encrypted successfully`,
      });
    } catch (error) {
      console.error("Encryption failed:", error);
      toast({
        title: "Encryption failed",
        description: "Failed to encrypt the file. Please try again.",
        variant: "destructive",
      });
      setEncrypt(false);
    } finally {
      setIsEncrypting(false);
    }
  };
  
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setEncryptedFile(null);
    setEncryptionData(null);
    setEncrypt(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleEncryptToggle = (checked: boolean) => {
    setEncrypt(checked);
    
    // If turning off encryption, reset encrypted file
    if (!checked) {
      setEncryptedFile(null);
      setEncryptionData(null);
    } else if (selectedFile && !encryptedFile) {
      // If turning on encryption and we have a file, encrypt it
      handleEncrypt();
    }
  };
  
  const handleUpload = () => {
    if (!selectedFile) return;
    
    const fileToUpload = encrypt && encryptedFile ? encryptedFile : selectedFile;
    
    const uploadData: UploadFileData = {
      file: fileToUpload,
      originalFile: encrypt ? selectedFile : undefined,
      encrypt: encrypt,
      encryptionData: encrypt && encryptionData ? encryptionData : undefined
    };
    
    onUpload(uploadData);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl bg-card p-0 border-border/40">
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
            <div className="space-y-6">
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
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-foreground" />
                    <span className="text-sm font-medium">Encrypt file</span>
                  </div>
                  <Switch 
                    checked={encrypt} 
                    onCheckedChange={handleEncryptToggle}
                    disabled={isEncrypting} 
                  />
                </div>
                
                {encrypt && encryptionData && (
                  <div className="mt-4 pt-4 border-t border-border/40">
                    <h4 className="text-sm font-medium mb-2">Encryption Details</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Algorithm:</span>
                        <span className="font-mono">{encryptionData.algorithm}</span>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-muted-foreground">Encryption Key:</span>
                          <Button variant="ghost" size="sm" className="h-5 py-0 px-2 text-xs"
                            onClick={() => {
                              navigator.clipboard.writeText(encryptionData.encryptionKey);
                              toast({ description: "Encryption key copied to clipboard" });
                            }}
                          >
                            Copy
                          </Button>
                        </div>
                        <div className="bg-secondary/40 p-1 rounded overflow-hidden">
                          <p className="text-xs font-mono text-ellipsis overflow-hidden">
                            {encryptionData.encryptionKey.substring(0, 20)}...
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-muted-foreground">IV:</span>
                          <Button variant="ghost" size="sm" className="h-5 py-0 px-2 text-xs"
                            onClick={() => {
                              navigator.clipboard.writeText(encryptionData.iv);
                              toast({ description: "IV copied to clipboard" });
                            }}
                          >
                            Copy
                          </Button>
                        </div>
                        <div className="bg-secondary/40 p-1 rounded overflow-hidden">
                          <p className="text-xs font-mono text-ellipsis overflow-hidden">
                            {encryptionData.iv.substring(0, 20)}...
                          </p>
                        </div>
                      </div>
                      <div className="pt-2">
                        <p className="text-xs text-warning-foreground">
                          <Key className="h-3 w-3 inline-block mr-1" />
                          Save these details to decrypt your file later
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <FilePreview file={encrypt && encryptedFile ? encryptedFile : selectedFile} />
            </div>
          )}
          
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              disabled={!selectedFile || (encrypt && isEncrypting)} 
              onClick={handleUpload}
              className={cn(!selectedFile && "opacity-50 cursor-not-allowed")}
            >
              {isEncrypting ? (
                <>
                  <Lock className="h-4 w-4 mr-2 animate-spin" />
                  Encrypting...
                </>
              ) : (
                <>Upload{encrypt ? " Encrypted File" : ""}</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
