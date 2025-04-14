
import { useState } from "react";
import { FileGrid } from "@/components/file-grid";
import { FileToolbar } from "@/components/file-toolbar";
import { UploadModal } from "@/components/upload-modal";
import { mockFiles } from "@/data/files";

export default function Dashboard() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [files, setFiles] = useState(mockFiles);
  const [searchQuery, setSearchQuery] = useState("");
  
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
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleFilter = () => {
    // Implement filtering logic
    console.log("Filter clicked");
  };
  
  const handleSort = () => {
    // Implement sorting logic
    console.log("Sort clicked");
  };
  
  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Files</h1>
      </div>
      
      <FileToolbar 
        onSearch={handleSearch}
        onFilter={handleFilter}
        onSort={handleSort}
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
