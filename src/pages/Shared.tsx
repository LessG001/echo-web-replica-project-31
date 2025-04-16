
import { useState, useEffect } from "react";
import { FileGrid } from "@/components/file-grid";
import { FileToolbar } from "@/components/file-toolbar";
import { getFilteredFiles } from "@/utils/file-storage";
import { FileInfo } from "@/types/file";
import { toast } from "sonner";
import { isAuthenticated } from "@/utils/auth";
import { useNavigate } from "react-router-dom";

export default function SharedPage() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<"grid" | "list">("grid");
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    
    // Load shared files
    loadFiles();
  }, [navigate]);
  
  const loadFiles = () => {
    // Get files filtered by shared
    const sharedFiles = getFilteredFiles("", "shared");
    setFiles(sharedFiles);
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filteredFiles = getFilteredFiles(query, "shared");
    setFiles(filteredFiles);
  };
  
  const handleFilter = () => {
    toast.info("Filter applied");
  };
  
  const handleSort = () => {
    toast.info("Files sorted");
  };
  
  const handleViewChange = (view: "grid" | "list") => {
    setCurrentView(view);
  };
  
  return (
    <div className="flex-1 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shared Files</h1>
      </div>
      
      <FileToolbar 
        onSearch={handleSearch}
        onFilter={handleFilter}
        onSort={handleSort}
        onViewChange={handleViewChange}
        currentView={currentView}
      />
      
      {files.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border/40 rounded-lg">
          <h3 className="text-lg font-medium mb-2">No shared files</h3>
          <p className="text-muted-foreground">
            You haven't shared any files yet.
          </p>
        </div>
      ) : (
        <FileGrid files={files} />
      )}
    </div>
  );
}
