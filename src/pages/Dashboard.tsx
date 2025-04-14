
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { FileGrid } from "@/components/file-grid";
import { FileToolbar } from "@/components/file-toolbar";
import { UploadModal } from "@/components/upload-modal";
import { mockFiles } from "@/data/files";
import { Button } from "@/components/ui/button";
import { NavIcons } from "@/components/ui/icons";

export default function Dashboard() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [files, setFiles] = useState(mockFiles);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<"grid" | "list">("grid");
  const { toast } = useToast();
  
  const filteredFiles = searchQuery
    ? files.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : files;
  
  const handleUpload = (file: File, encrypt: boolean) => {
    const newFile = {
      id: `file-${files.length + 1}`,
      name: file.name,
      extension: file.name.split('.').pop() || '',
      size: `${(file.size / 1024).toFixed(2)} KB`,
      tags: [],
      timestamp: "less than a minute ago",
      isFavorite: false,
      isShared: false
    };
    
    setFiles([newFile, ...files]);
    toast({
      title: "File uploaded successfully",
      description: `${file.name} has been uploaded ${encrypt ? 'with encryption' : ''}`,
    });
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleFilter = () => {
    toast({
      title: "Filter applied",
      description: "Files have been filtered",
    });
  };
  
  const handleSort = () => {
    const sortedFiles = [...files].sort((a, b) => a.name.localeCompare(b.name));
    setFiles(sortedFiles);
    toast({
      title: "Files sorted",
      description: "Files have been sorted alphabetically",
    });
  };
  
  const handleViewChange = (view: "grid" | "list") => {
    setCurrentView(view);
    toast({
      description: `View changed to ${view} view`,
    });
  };
  
  return (
    <div className="flex-1 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Files</h1>
        <Button onClick={() => setIsUploadModalOpen(true)}>
          <NavIcons.Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
      </div>
      
      <FileToolbar 
        onSearch={handleSearch}
        onFilter={handleFilter}
        onSort={handleSort}
        onViewChange={handleViewChange}
        currentView={currentView}
      />
      
      <FileGrid files={filteredFiles} />
      
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
}
