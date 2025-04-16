
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Upload, X } from "lucide-react";
import { encryptFile } from "@/utils/encryption";
import { generateFileId, formatFileSize, formatTimestamp, addFile, saveFileContent } from "@/utils/file-storage";
import { getCurrentUser } from "@/utils/auth";
import { FileInfo, EncryptionData } from "@/types/file";
import { FilePreview } from "@/components/file-preview";
import { toast } from "sonner";

export interface UploadFileData {
  file: File;
  fileInfo: FileInfo;
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
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setEncryptedFile(null);
      setEncryptionKey("");
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setEncryptedFile(null);
      setEncryptionKey("");
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
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
          const encryptionResult = await encryptFile(selectedFile);
          encryptedFileObj = encryptionResult.encryptedFile;
          fileEncryptionData = {
            algorithm: encryptionResult.algorithm,
            encryptionKey: encryptionResult.encryptionKey,
            iv: encryptionResult.iv
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
        fileInfo.checksum = "checksum-placeholder"; // In a real app, calculate this
      }
      
      // Save file info to storage
      addFile(fileInfo);
      
      // Save file content
      saveFileContent(fileId, fileToUpload);
      
      clearInterval(interval);
      setUploadProgress(100);
      
      // Prepare file data for callback
      const fileData: UploadFileData = {
        file: selectedFile,
        fileInfo: fileInfo,
      };
      
      if (encryptedFileObj && fileEncryptionData) {
        fileData.encryptedFile = encryptedFileObj;
        fileData.encryptionData = fileEncryptionData;
      }
      
      // Notify parent component
      if (onUpload) {
        onUpload(fileData);
      }
      
      // Reset state
      setTimeout(() => {
        setSelectedFile(null);
        setEncryptedFile(null);
        setEncryptionKey("");
        setTags([]);
        setTagInput("");
        setEncryptFile(false);
        setUploadProgress(0);
        setIsUploading(false);
        onClose();
      }, 1000);
      
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
  
  const resetForm = () => {
    setSelectedFile(null);
    setEncryptedFile(null);
    setEncryptionKey("");
    setTags([]);
    setTagInput("");
    setUploadProgress(0);
    setIsUploading(false);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              
              {encryptFile && encryptionKey && (
                <div className="bg-secondary/20 p-4 rounded-md border border-border/40">
                  <div className="flex items-center mb-2">
                    <Lock className="h-4 w-4 text-primary mr-2" />
                    <h3 className="font-medium">Encryption Key</h3>
                  </div>
                  <p className="text-sm mb-2">
                    Save this key securely! You will need it to decrypt the file. It will only be shown once.
                  </p>
                  <div className="flex">
                    <Input
                      value={encryptionKey}
                      readOnly
                      className="text-xs font-mono"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-2 whitespace-nowrap"
                      onClick={() => {
                        navigator.clipboard.writeText(encryptionKey);
                        toast.success("Encryption key copied to clipboard");
                      }}
                    >
                      Copy
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
                    />
                    <Button 
                      variant="outline" 
                      className="ml-2" 
                      type="button"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim()}
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
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={resetForm} disabled={isUploading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading}
          >
            Upload
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
