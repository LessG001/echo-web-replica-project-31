
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Upload, X, Copy, CheckCircle2 } from "lucide-react";
import { encryptFile as encryptFileUtil } from "@/utils/encryption";
import { generateFileId, formatFileSize, formatTimestamp, addFile, saveFileContent } from "@/utils/file-storage";
import { getCurrentUser } from "@/utils/auth";
import { FileInfo, EncryptionData } from "@/types/file";
import { FilePreview } from "@/components/file-preview";
import { toast } from "sonner";

export interface UploadFileData {
  file: File;
  fileInfo: FileInfo;
  encrypt: boolean;
  encryptedFile?: File;
  encryptionData?: EncryptionData;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload?: (fileData?: UploadFileData) => void;
}

export function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptFile, setEncryptFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [encryptedFile, setEncryptedFile] = useState<File | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [uploadComplete, setUploadComplete] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setEncryptedFile(null);
      setEncryptionKey("");
      setUploadComplete(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setEncryptedFile(null);
      setEncryptionKey("");
      setUploadComplete(false);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadComplete(false);
    
    try {
      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      // Get current user
      const user = getCurrentUser();
      const username = user ? user.email : "Anonymous";
      
      // Generate file metadata
      const fileId = generateFileId();
      const now = new Date();
      const fileExtension = selectedFile.name.split('.').pop() || '';
      
      let fileToUpload = selectedFile;
      let fileEncryptionData: EncryptionData | undefined;
      let encryptedFileObj: File | undefined;
      
      // Encrypt file if encryption is enabled
      if (encryptFile) {
        setIsEncrypting(true);
        
        try {
          const encryptionResult = await encryptFileUtil(selectedFile);
          encryptedFileObj = encryptionResult.encryptedFile;
          fileEncryptionData = {
            algorithm: encryptionResult.algorithm,
            encryptionKey: encryptionResult.encryptionKey,
            iv: encryptionResult.iv,
            checksum: encryptionResult.checksum
          };
          
          setEncryptedFile(encryptedFileObj);
          setEncryptionKey(encryptionResult.encryptionKey);
          fileToUpload = encryptedFileObj; // Upload the encrypted file
          
          // Save both files
          saveFileContent(`${fileId}_original`, selectedFile);
        } catch (err) {
          console.error("Encryption failed:", err);
          toast.error("Failed to encrypt file");
          clearInterval(interval);
          setIsUploading(false);
          setIsEncrypting(false);
          return;
        }
        
        setIsEncrypting(false);
      }
      
      // Create file info object
      const fileInfo: FileInfo = {
        id: fileId,
        name: selectedFile.name,
        extension: fileExtension,
        size: formatFileSize(fileToUpload.size),
        type: fileToUpload.type,
        created: formatTimestamp(now),
        modified: formatTimestamp(now),
        createdBy: username,
        modifiedBy: username,
        isFavorite: false,
        isShared: false,
        isEncrypted: encryptFile,
        tags: tags,
        timestamp: now.toISOString(),
      };
      
      // Add encryption data if available
      if (encryptFile && fileEncryptionData) {
        fileInfo.encryptionData = fileEncryptionData;
        fileInfo.checksum = fileEncryptionData.checksum;
      }
      
      // Save file info to storage
      addFile(fileInfo);
      
      // Save file content
      saveFileContent(fileId, fileToUpload);
      
      clearInterval(interval);
      setUploadProgress(100);
      setUploadComplete(true);
      
      // Prepare file data for callback
      const fileData: UploadFileData = {
        file: selectedFile,
        fileInfo: fileInfo,
        encrypt: encryptFile
      };
      
      if (encryptedFileObj && fileEncryptionData) {
        fileData.encryptedFile = encryptedFileObj;
        fileData.encryptionData = fileEncryptionData;
      }
      
      // If encrypted, we'll call onUpload when the user clicks "Continue"
      if (!encryptFile && onUpload) {
        onUpload(fileData);
        
        // Reset state and close modal for non-encrypted files
        setTimeout(() => {
          resetForm();
          onClose();
        }, 1000);
      } else if (encryptFile) {
        // Just mark as complete but don't close for encrypted files
        toast.success("File encrypted successfully");
        // We store the fileData to use when user clicks "Continue"
        window.uploadedFileData = fileData;
      }
      
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload file");
      setIsUploading(false);
    }
  };
  
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };
  
  const handleCopyKey = () => {
    if (encryptionKey) {
      navigator.clipboard.writeText(encryptionKey);
      setKeyCopied(true);
      toast.success("Encryption key copied to clipboard");
      
      // Reset the copied status after 3 seconds
      setTimeout(() => setKeyCopied(false), 3000);
    }
  };
  
  const handleContinue = () => {
    if (window.uploadedFileData && onUpload) {
      onUpload(window.uploadedFileData);
      window.uploadedFileData = undefined;
    }
    resetForm();
    onClose();
  };
  
  const resetForm = () => {
    setSelectedFile(null);
    setEncryptedFile(null);
    setEncryptionKey("");
    setTags([]);
    setTagInput("");
    setEncryptFile(false);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadComplete(false);
    setKeyCopied(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Only allow closing if we're not in the middle of uploading
      if (!open && !isUploading) {
        resetForm();
      }
    }}>
      <DialogContent className="sm:max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
        </DialogHeader>
        
        {!selectedFile ? (
          <div 
            className="border-2 border-dashed border-border rounded-lg p-10 text-center cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <p className="mb-1 font-medium">Drag and drop your file here</p>
            <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
            <Input 
              id="file-upload" 
              type="file" 
              className="hidden" 
              onChange={handleFileChange} 
            />
            <Button variant="secondary" className="mx-auto">
              Browse Files
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="preview">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="preview">File Preview</TabsTrigger>
              <TabsTrigger value="options">Upload Options</TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{selectedFile.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setSelectedFile(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <FilePreview 
                file={selectedFile} 
                encryptedFile={encryptedFile || undefined}
              />
              
              {uploadComplete && encryptFile && encryptionKey && (
                <div className="bg-secondary/20 p-4 rounded-md border border-border/40">
                  <div className="flex items-center mb-2">
                    <Lock className="h-4 w-4 text-primary mr-2" />
                    <h3 className="font-medium">Encryption Key</h3>
                  </div>
                  <p className="text-sm mb-2">
                    <strong>IMPORTANT:</strong> Save this key securely! You will need it to decrypt the file. It will only be shown once.
                  </p>
                  <div className="flex">
                    <Input
                      value={encryptionKey}
                      readOnly
                      className="text-xs font-mono bg-background"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-2 whitespace-nowrap"
                      onClick={handleCopyKey}
                    >
                      {keyCopied ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="options" className="space-y-4">
              <div className="space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="filename">File Name</Label>
                  <Input 
                    id="filename" 
                    value={selectedFile.name} 
                    disabled 
                  />
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="encrypt" 
                    checked={encryptFile} 
                    onCheckedChange={(checked) => {
                      if (checked === true) {
                        setEncryptFile(true);
                      } else {
                        setEncryptFile(false);
                        setEncryptedFile(null);
                        setEncryptionKey("");
                      }
                    }} 
                    disabled={isUploading || uploadComplete}
                  />
                  <div className="grid gap-1.5">
                    <Label 
                      htmlFor="encrypt" 
                      className="text-base cursor-pointer"
                    >
                      Encrypt file
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      The file will be encrypted with AES-256 and can only be decrypted with the encryption key.
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex mt-1.5">
                    <Input 
                      id="tags" 
                      value={tagInput} 
                      onChange={(e) => setTagInput(e.target.value)} 
                      placeholder="Add tags..." 
                      className="flex-1"
                      disabled={isUploading || uploadComplete}
                    />
                    <Button 
                      variant="outline" 
                      className="ml-2" 
                      type="button"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim() || isUploading || uploadComplete}
                    >
                      Add
                    </Button>
                  </div>
                  
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {tags.map(tag => (
                        <div 
                          key={tag} 
                          className="bg-secondary py-1 px-2 rounded-full text-sm flex items-center"
                        >
                          {tag}
                          <button 
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1.5 text-muted-foreground hover:text-foreground"
                            disabled={isUploading || uploadComplete}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
        
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                {uploadProgress < 100 
                  ? `${isEncrypting ? 'Encrypting' : 'Uploading'}...` 
                  : 'Upload complete!'
                }
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}
        
        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={resetForm} disabled={isUploading}>
            Cancel
          </Button>
          
          {uploadComplete && encryptFile ? (
            <Button 
              onClick={handleContinue}
              disabled={isUploading}
            >
              Continue
            </Button>
          ) : (
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || isUploading || uploadComplete}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Declare window to extend the Window interface
declare global {
  interface Window {
    uploadedFileData?: UploadFileData;
  }
}
