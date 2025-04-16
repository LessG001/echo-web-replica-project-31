
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavIcons } from "@/components/ui/icons";
import { FileDetail } from "@/components/file-detail";
import { getFileById } from "@/data/files";
import { useToast } from "@/hooks/use-toast";
import { FilePreview } from "@/components/file-preview";
import { decryptFile } from "@/utils/encryption";

export default function FileDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [encryptedFileObject, setEncryptedFileObject] = useState<File | null>(null);
  const [decryptedFile, setDecryptedFile] = useState<File | null>(null);
  const [decrypting, setDecrypting] = useState(false);
  
  const file = id ? getFileById(id) : null;
  
  useEffect(() => {
    // Try to load file content from localStorage
    if (file && id) {
      const storedFile = localStorage.getItem(`file_${id}`);
      if (storedFile) {
        setFileContent(storedFile);
        
        // Convert data URL to file object
        const contentType = file.type || 'application/octet-stream';
        const byteString = atob(storedFile.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([ab], { type: contentType });
        const fileObj = new File([blob], file.name, { type: contentType });
        
        // Save encrypted file object
        if (file.isEncrypted) {
          setEncryptedFileObject(fileObj);
          // Automatically try to decrypt if we have encryption data
          if (file.encryptionData) {
            handleDecrypt(fileObj, file.encryptionData.encryptionKey, file.encryptionData.iv);
          }
        } else {
          // For non-encrypted files, just set the file object
          setFileObject(fileObj);
        }
      }
    }
  }, [file, id]);
  
  const handleDecrypt = async (fileToDecrypt: File, key: string, iv: string) => {
    if (!fileToDecrypt) return;
    
    setDecrypting(true);
    
    try {
      // For simplicity, extract IV from the key if it contains it
      const parts = key.split('.');
      let actualIv = iv;
      let actualKey = key;
      
      if (parts.length > 1) {
        // Last part is the IV
        actualIv = parts[parts.length - 1];
        // The rest is the key
        actualKey = parts.slice(0, -1).join('.');
      }
      
      console.log("Decrypting with key:", actualKey, "and IV:", actualIv);
      const decrypted = await decryptFile(fileToDecrypt, actualKey, actualIv);
      setDecryptedFile(decrypted);
      setFileObject(decrypted); // Set decrypted file as the main file object for preview
      
      console.log("File decrypted successfully:", decrypted);
    } catch (error) {
      console.error("Failed to decrypt file:", error);
      toast({
        title: "Decryption failed",
        description: "Could not decrypt the file with the provided key",
        variant: "destructive",
      });
    } finally {
      setDecrypting(false);
    }
  };
  
  if (!file) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="mr-4 flex items-center" 
            onClick={() => navigate("/dashboard")}
          >
            <NavIcons.Back className="h-4 w-4 mr-2" />
            Back to Files
          </Button>
        </div>
        
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <h2 className="text-xl font-semibold mb-2">File Not Found</h2>
          <p className="text-muted-foreground">The file you're looking for doesn't exist or has been moved.</p>
          <Button 
            className="mt-4" 
            onClick={() => navigate("/dashboard")}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  const handleDownload = () => {
    // If we have a decrypted version for encrypted files, download that
    const fileToDownload = decryptedFile || fileObject;
    
    if (fileToDownload) {
      const url = URL.createObjectURL(fileToDownload);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileToDownload.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download started",
        description: `${fileToDownload.name} is being downloaded`,
      });
    } else {
      toast({
        title: "Download failed",
        description: "Could not download the file",
        variant: "destructive",
      });
    }
  };
  
  const handleShare = () => {
    toast({
      title: "Sharing options",
      description: `Share options for ${file.name} opened`,
    });
  };
  
  const handleDelete = () => {
    toast({
      title: "File deleted",
      description: `${file.name} has been deleted`,
      variant: "destructive",
    });
    
    // Remove file from localStorage if exists
    if (id) {
      localStorage.removeItem(`file_${id}`);
    }
    
    navigate("/dashboard");
  };
  
  return (
    <div className="flex-1 p-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="mr-4 flex items-center" 
          onClick={() => navigate("/dashboard")}
        >
          <NavIcons.Back className="h-4 w-4 mr-2" />
          Back to Files
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FileDetail 
          file={file}
          onDownload={handleDownload}
          onShare={handleShare}
          onDelete={handleDelete}
        />
        
        {/* Show file preview with both decrypted and encrypted options */}
        {(fileObject || encryptedFileObject) ? (
          <div>
            <FilePreview 
              file={fileObject || decryptedFile || encryptedFileObject}
              encryptedFile={file.isEncrypted ? encryptedFileObject : undefined}
              onDownload={handleDownload}
            />
            
            {file.isEncrypted && file.encryptionData && (
              <div className="mt-6 bg-card border border-border/40 rounded-lg p-4 md:p-6">
                <h3 className="text-lg font-medium mb-3">Decryption Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Encryption Algorithm:</p>
                    <p className="font-mono text-sm bg-secondary/40 p-2 rounded">
                      {file.encryptionData.algorithm}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-muted-foreground">Encryption Key:</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 py-0 px-2"
                        onClick={() => {
                          navigator.clipboard.writeText(file.encryptionData.encryptionKey);
                          toast({ description: "Encryption key copied to clipboard" });
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="font-mono text-xs bg-secondary/40 p-2 rounded overflow-auto max-h-20">
                      {file.encryptionData.encryptionKey}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
