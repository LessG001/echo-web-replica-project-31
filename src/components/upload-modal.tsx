
import { useState, useRef, useEffect } from "react";
import { X, Upload, File, Key, Lock } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FilePreview } from "@/components/file-preview";
import { cn } from "@/lib/utils";
import { encryptFile, calculateChecksum } from "@/utils/encryption";
import { useToast } from "@/hooks/use-toast";
import { generateFileId, formatFileSize, addFile, storeFileContent } from "@/utils/file-storage";
import { getCurrentUser } from "@/utils/auth";
import { logInfo, LogCategory } from "@/utils/audit-logger";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: () => void;
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
      resetFileState();
    }
  }, [isOpen]);
  
  const resetFileState = () => {
    setSelectedFile(null);
    setEncryptedFile(null);
    setEncryptionData(null);
    setEncrypt(false);
    setIsEncrypting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processSelectedFile(file);
    }
  };
  
  const processSelectedFile = (file: File) => {
    setSelectedFile(file);
    setEncryptedFile(null);
    setEncryptionData(null);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processSelectedFile(file);
    }
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
      const { encryptedFile: encrypted, algorithm, encryptionKey, iv, checksum } = await encryptFile(selectedFile);
      
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
  
  const handleEncryptToggle = (checked: boolean) => {
    setEncrypt(checked);
    
    if (!checked) {
      setEncryptedFile(null);
      setEncryptionData(null);
    } else if (selectedFile && !encryptedFile) {
      handleEncrypt();
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    const fileToUpload = encrypt && encryptedFile ? encryptedFile : selectedFile;
    
    try {
      // Convert file to data URL for storage
      const fileReader = new FileReader();
      
      fileReader.onload = async (e) => {
        try {
          const fileContent = e.target?.result;
          
          // Generate file ID
          const fileId = generateFileId();
          
          // Generate additional file metadata
          const now = new Date();
          const currentUser = getCurrentUser();
          const fileType = fileToUpload.type.split('/')[0] || 'document';
          const tags = [fileType];
          if (encrypt) tags.push('encrypted');
          
          // Create file record
          const newFile = {
            id: fileId,
            name: fileToUpload.name,
            extension: fileToUpload.name.split('.').pop() || '',
            size: formatFileSize(fileToUpload.size),
            tags: tags,
            timestamp: now.toISOString(),
            isFavorite: false,
            isShared: false,
            type: fileToUpload.type || 'application/octet-stream',
            created: now.toISOString(),
            modified: now.toISOString(),
            createdBy: currentUser?.email || "Unknown User",
            modifiedBy: currentUser?.email || "Unknown User",
            isEncrypted: encrypt,
            checksum: encrypt ? encryptionData?.checksum : await calculateChecksum(selectedFile),
            encryptionData: encrypt && encryptionData ? {
              algorithm: encryptionData.algorithm,
              encryptionKey: encryptionData.encryptionKey,
              iv: encryptionData.iv
            } : undefined
          };
          
          // Save file content
          if (fileContent) {
            storeFileContent(fileId, fileContent);
          }
          
          // Save file record
          addFile(newFile);
          
          // Log file upload
          logInfo(LogCategory.FILE, `File uploaded: ${fileToUpload.name}`, {
            fileId,
            fileName: fileToUpload.name,
            encrypted: encrypt
          });
          
          onUpload();
        } catch (error) {
          console.error("Failed to process uploaded file:", error);
          toast({
            title: "Upload failed",
            description: "Failed to process the uploaded file",
            variant: "destructive",
          });
        }
      };
      
      fileReader.readAsDataURL(fileToUpload);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card p-0 border-border/40">
        <div className="flex flex-col p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Upload File</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {!selectedFile ? (
            <div 
              className="border-2 border-dashed border-border/60 rounded-lg p-6 text-center flex flex-col items-center justify-center space-y-4"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <Upload className="h-10 w-10 text-primary" />
              <div>
                <h3 className="text-base font-medium mb-2">Upload File</h3>
                <p className="text-muted-foreground text-sm mb-4">Drag and drop your file here, or click to browse</p>
                <Button 
                  variant="outline" 
                  onClick={handleBrowseClick}
                >
                  Browse Files
                </Button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border border-border/60 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <File className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={resetFileState} 
                    className="h-8 w-8"
                  >
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
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium">Encryption Key</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          navigator.clipboard.writeText(encryptionData.encryptionKey);
                          toast({ description: "Encryption key copied to clipboard" });
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                    <div className="bg-secondary/40 p-2 rounded text-xs font-mono truncate">
                      {encryptionData.encryptionKey}
                    </div>
                  </div>
                )}
              </div>
              
              <FilePreview file={selectedFile} />
            </div>
          )}
          
          <div className="flex justify-end gap-3">
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
                <>Upload{encrypt ? " Encrypted" : ""}</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
