import { useState } from "react";
import { Star, Download, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { FileIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { downloadFile } from "@/utils/encryption";
import { FileInfo } from "@/types/file";

interface FileCardProps {
  file: FileInfo;
  onToggleFavorite: (id: string) => void;
  className?: string;
}

export function FileCard({ file, onToggleFavorite, className }: FileCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();
  
  // Extract file extension from name if not provided
  const fileExtension = file.extension || file.name.split('.').pop() || '';
  
  const handleToggleFavorite = () => {
    onToggleFavorite(file.id);
    toast({
      description: file.isFavorite 
        ? `${file.name} removed from favorites` 
        : `${file.name} added to favorites`,
    });
  };
  
  const handleDownload = () => {
    // Try to retrieve file from localStorage
    const storedFile = localStorage.getItem(`file_${file.id}`);
    if (storedFile) {
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
      
      // Download the file
      downloadFile(fileObj);
      
      toast({
        title: "Download started",
        description: `${file.name} is being downloaded`,
      });
    } else {
      toast({
        title: "Download failed",
        description: "Could not download the file",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div 
      className={cn("file-card flex flex-col p-4 bg-card border border-border/40 rounded-lg", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start mb-2">
        <Link to={`/files/${file.id}`} className="flex-1">
          <div className="flex items-start gap-3">
            <FileIcon extension={fileExtension} size={28} />
            <div className="flex flex-col text-left">
              <span className="font-medium truncate max-w-[200px]">{file.name}</span>
              <span className="text-sm text-muted-foreground">{file.size}</span>
            </div>
          </div>
        </Link>
        
        <div className="flex">
          {isHovered && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full" 
              onClick={handleDownload}
              title="Download file"
            >
              <Download className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
          
          {(file.isFavorite || isHovered) && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full" 
              onClick={handleToggleFavorite}
              title={file.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star 
                className={cn(
                  "h-4 w-4", 
                  file.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                )} 
              />
            </Button>
          )}
        </div>
      </div>
      
      <div className="mt-auto pt-2 flex flex-wrap gap-1">
        {file.tags.map((tag) => (
          <span key={tag} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary/40 text-foreground">{tag}</span>
        ))}
        
        {file.isEncrypted && (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/20 text-primary">
            <Lock className="h-3 w-3 mr-1" />
            Encrypted
          </span>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-3 pt-2 border-t border-border/40">
        <span className="text-xs text-muted-foreground">{file.timestamp}</span>
        {file.isShared && (
          <span className="text-xs font-medium text-muted-foreground">Shared</span>
        )}
      </div>
    </div>
  );
}
