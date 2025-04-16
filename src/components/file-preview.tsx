
import { useState, useEffect } from "react";
import { Download, File, FileText, Image, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { generateFilePreview } from "@/utils/encryption";

interface FilePreviewProps {
  file: File;
  onDownload?: () => void;
}

export function FilePreview({ file, onDownload }: FilePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadPreview = async () => {
      setLoading(true);
      setError(false);
      
      try {
        if (!file) throw new Error("No file provided");
        
        const url = await generateFilePreview(file);
        setPreviewUrl(url);
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
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [file]);
  
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
    
    if (error || !previewUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <File className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Preview not available</p>
          <p className="text-sm text-muted-foreground">This file type cannot be previewed</p>
        </div>
      );
    }
    
    if (file.type.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center h-full">
          <img 
            src={previewUrl} 
            alt={file.name} 
            className="max-w-full max-h-64 object-contain" 
          />
        </div>
      );
    }
    
    if (file.type === 'application/pdf') {
      return (
        <iframe 
          src={previewUrl} 
          className="w-full h-64 border border-border/40 rounded-md" 
          title={file.name}
        />
      );
    }
    
    if (file.type === 'text/plain' || 
        file.type === 'text/html' || 
        file.type === 'text/css' || 
        file.type === 'application/json' ||
        file.type === 'text/javascript') {
      return (
        <div className="w-full h-64 border border-border/40 rounded-md bg-secondary/20 p-4 overflow-auto">
          <pre className="text-xs font-mono">
            <iframe 
              src={previewUrl} 
              className="w-full h-full border-0" 
              title={file.name}
            />
          </pre>
        </div>
      );
    }
    
    // Default preview
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="font-medium">{file.name}</p>
        <p className="text-sm text-muted-foreground">
          {(file.size / 1024).toFixed(2)} KB
        </p>
      </div>
    );
  };
  
  return (
    <div className="file-preview bg-card rounded-lg border border-border/40 p-4">
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
              {previewUrl && (
                <Button variant="outline" size="sm" onClick={() => window.open(previewUrl || '', '_blank')}>
                  <Image className="h-4 w-4 mr-1" />
                  Open
                </Button>
              )}
              {onDownload && (
                <Button variant="outline" size="sm" onClick={onDownload}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
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
