import { useState, useRef, useEffect } from "react";
import { X, Upload, File, Key, Lock } from "lucide-react";
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
  const [fileDetails, setFileDetails] = useState<{
    type: string;
    size: string;
    lastModified: string;
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
      setFileDetails(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setEncryptedFile(null);
      setEncryptionData(null);
      
      // Set file details
      setFileDetails({
        type: file.type || 'Unknown',
        size: formatFileSize(file.size),
        lastModified: new Date(file.lastModified).toLocaleString()
      });
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setEncryptedFile(null);
      setEncryptionData(null);
      
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
              onDragOver={(e) => e.preventDefault()}
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
                        {fileDetails?.size}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      setSelectedFile(null);
                      setEncryptedFile(null);
                      setEncryptionData(null);
                      setEncrypt(false);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }} 
                    className="h-8 w-8"
                  >
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
                    <h4 className="text-sm font-medium mb-2">Encryption Key</h4>
                    <div className="space-y-2 text-xs">
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
                            {encryptionData.encryptionKey}
                          </p>
                        </div>
                      </div>
                      <div className="pt-2">
                        <p className="text-xs text-warning-foreground">
                          <Key className="h-3 w-3 inline-block mr-1" />
                          Save this key to decrypt your file later
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
            <Button variant="outline" onClick={onClose} className="w-24">
              Cancel
            </Button>
            <Button 
              disabled={!selectedFile || (encrypt && isEncrypting)} 
              onClick={handleUpload}
              className={cn(!selectedFile && "opacity-50 cursor-not-allowed", "w-32")}
            >
              {isEncrypting ? (
                <>
                  <Lock className="h-4 w-4 mr-2 animate-spin" />
                  Encrypting...
                </>
              ) : (
                <>Upload{encrypt ? " Encrypted" : ""}</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
