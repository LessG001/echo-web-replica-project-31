
import { useState, useEffect } from "react";
import { Download, File, FileText, Image, RefreshCw, Unlock, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { generateFilePreview } from "@/utils/encryption";

interface FilePreviewProps {
  file: any;
  encryptedFile?: File;
  onDownload?: () => void;
  requiresDecryption?: boolean;
  onDecrypt?: (key: string) => void;
  className?: string;
}

export function FilePreview({ 
  file, 
  encryptedFile, 
  onDownload,
  requiresDecryption = false,
  onDecrypt,
  className
}: FilePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [decryptionKey, setDecryptionKey] = useState("");
  const [decrypting, setDecrypting] = useState(false);

  useEffect(() => {
    const loadPreview = async () => {
      setLoading(true);
      setError(false);
      
      try {
        if (!file) throw new Error("No file provided");
        
        // If file requires decryption, don't try to generate preview
        if (requiresDecryption) {
          setLoading(false);
          return;
        }
        
        // Generate actual file preview
        if (file instanceof File) {
          // For real files
          const preview = await generateFilePreview(file);
          setPreviewUrl(preview);
        } else if (file.previewUrl) {
          // For FileInfo objects that already have a preview URL
          setPreviewUrl(file.previewUrl);
        } else {
          // Default placeholder
          setPreviewUrl("#");
        }
      } catch (err) {
        console.error("Failed to generate preview:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    loadPreview();
    
    // Cleanup
    return () => {
      if (previewUrl && previewUrl !== "#") {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [file, requiresDecryption]);
  
  const handleDownloadOriginal = () => {
    if (file && !requiresDecryption) {
      // Always download the decrypted/original file when available
      if (onDownload) {
        onDownload();
      } else {
        toast.success(`${file.name} is being downloaded`);
      }
    } else if (onDownload) {
      onDownload();
    }
  };
  
  const handleDownloadEncrypted = () => {
    if (encryptedFile) {
      // In a real implementation, we would use downloadFile utility
      toast.success(`${encryptedFile.name} is being downloaded`);
    }
  };
  
  const handleDecrypt = (e: React.FormEvent) => {
    e.preventDefault();
    if (onDecrypt && decryptionKey.trim()) {
      setDecrypting(true);
      try {
        onDecrypt(decryptionKey.trim());
      } finally {
        setDecrypting(false);
      }
    } else {
      toast.error("Please enter a decryption key");
    }
  };
  
  // Get appropriate preview component based on file type
  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <Skeleton className="w-full h-64" />
          <p className="text-muted-foreground mt-2">Loading preview...</p>
        </div>
      );
    }
    
    if (requiresDecryption) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <Lock className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Encrypted Content</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            This file is encrypted. Enter the decryption key to view its contents.
          </p>
          
          <form onSubmit={handleDecrypt} className="w-full max-w-md">
            <div className="flex">
              <Input
                value={decryptionKey}
                onChange={(e) => setDecryptionKey(e.target.value)}
                placeholder="Paste your decryption key here"
                className="flex-1"
                disabled={decrypting}
              />
              <Button
                type="submit"
                className="ml-2"
                disabled={decrypting || !decryptionKey.trim()}
              >
                {decrypting ? (
                  <>
                    <Unlock className="h-4 w-4 mr-2 animate-spin" />
                    Decrypting...
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4 mr-2" />
                    Decrypt
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      );
    }
    
    if (error || !previewUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <File className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Preview not available</p>
          <p className="text-sm text-muted-foreground">This file type cannot be previewed</p>
        </div>
      );
    }
    
    // Attempt to render preview based on content type
    if (previewUrl !== "#") {
      if (file.type?.startsWith('image/') || (typeof file === 'object' && file.extension?.match(/jpe?g|png|gif|bmp|webp/i))) {
        return (
          <div className="flex items-center justify-center h-full p-2">
            <img src={previewUrl} alt={file.name} className="max-w-full max-h-64 object-contain" />
          </div>
        );
      }
      
      if (file.type === 'application/pdf' || (typeof file === 'object' && file.extension === 'pdf')) {
        return (
          <div className="flex flex-col items-center justify-center h-full p-2">
            <iframe src={previewUrl} className="w-full h-64 border-none" title={file.name}></iframe>
          </div>
        );
      }
      
      if (file.type?.startsWith('text/') || (typeof file === 'object' && file.extension?.match(/txt|md|css|html|js|json/i))) {
        return (
          <div className="flex flex-col items-center justify-center h-full p-2">
            <div className="bg-secondary/30 p-4 rounded w-full h-64 overflow-auto">
              <pre className="text-xs whitespace-pre-wrap">{previewUrl}</pre>
            </div>
          </div>
        );
      }
    }
    
    // Default preview
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="font-medium">{file.name}</p>
        <p className="text-sm text-muted-foreground">
          {file.size}
        </p>
      </div>
    );
  };
  
  return (
    <div className={`file-preview bg-card rounded-lg border border-border/40 p-4 ${className || ''}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-medium">File Preview</h3>
        <div className="flex gap-2">
          {loading ? (
            <Button variant="outline" size="sm" disabled>
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              Loading
            </Button>
          ) : (
            <>
              {previewUrl && !requiresDecryption && previewUrl !== "#" && (
                <Button variant="outline" size="sm" onClick={() => window.open(previewUrl, '_blank')}>
                  <Image className="h-4 w-4 mr-1" />
                  Open
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadOriginal}
                disabled={requiresDecryption && !onDownload}
              >
                <Download className="h-4 w-4 mr-1" />
                Download {requiresDecryption ? "File" : "Decrypted"}
              </Button>
              {encryptedFile && (
                <Button variant="secondary" size="sm" onClick={handleDownloadEncrypted}>
                  <Download className="h-4 w-4 mr-1" />
                  Download Encrypted
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="preview-container min-h-48 md:min-h-64 flex items-center justify-center border border-border/30 rounded-md bg-secondary/20">
        {renderPreview()}
      </div>
    </div>
  );
}
