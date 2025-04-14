
import { useState } from "react";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { FileIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export interface FileInfo {
  id: string;
  name: string;
  extension: string;
  size: string;
  tags: string[];
  timestamp: string;
  isFavorite?: boolean;
  isShared?: boolean;
}

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
        
        {(file.isFavorite || isHovered) && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full" 
            onClick={handleToggleFavorite}
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
      
      <div className="mt-auto pt-2 flex flex-wrap gap-1">
        {file.tags.map((tag) => (
          <span key={tag} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary/40 text-foreground">{tag}</span>
        ))}
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
