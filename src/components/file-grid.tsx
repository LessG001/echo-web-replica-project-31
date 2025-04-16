
import { useState } from "react";
import { FileCard } from "@/components/file-card";
import { FileInfo } from "@/types/file";

interface FileGridProps {
  files: FileInfo[];
  className?: string;
}

export function FileGrid({ files, className }: FileGridProps) {
  const [favoriteFiles, setFavoriteFiles] = useState<string[]>(
    files.filter(file => file.isFavorite).map(file => file.id)
  );
  
  const handleToggleFavorite = (fileId: string) => {
    setFavoriteFiles(prev => 
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };
  
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
      {files.map(file => (
        <FileCard 
          key={file.id} 
          file={{
            ...file,
            isFavorite: favoriteFiles.includes(file.id)
          }}
          onToggleFavorite={handleToggleFavorite}
        />
      ))}
    </div>
  );
}
