
import { useState, useEffect } from "react";
import { FileGrid } from "@/components/file-grid";
import { FileToolbar } from "@/components/file-toolbar";
import { getFilteredFiles, FileInfo } from "@/utils/file-storage";
import { Button } from "@/components/ui/button";
import { DecryptionModal } from "@/components/decryption-modal";
import { toast } from "sonner";
import { isAuthenticated } from "@/utils/auth";
import { useNavigate } from "react-router-dom";
import { Unlock } from "lucide-react";

export default function EncryptedPage() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<"grid" | "list">("grid");
  const [isDecryptModalOpen, setIsDecryptModalOpen] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    
    // Load encrypted files
    loadFiles();
  }, [navigate]);
  
  const loadFiles = () => {
    // Get files filtered by encrypted
    const encryptedFiles = getFilteredFiles("", "encrypted");
    setFiles(encryptedFiles);
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filteredFiles = getFilteredFiles(query, "encrypted");
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
        <h1 className="text-2xl font-bold">Encrypted Files</h1>
        <Button onClick={() => setIsDecryptModalOpen(true)}>
          <Unlock className="h-4 w-4 mr-2" />
          Decrypt File
        </Button>
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
          <h3 className="text-lg font-medium mb-2">No encrypted files</h3>
          <p className="text-muted-foreground">
            You haven't uploaded any encrypted files yet.
          </p>
        </div>
      ) : (
        <FileGrid files={files} />
      )}
      
      <DecryptionModal
        isOpen={isDecryptModalOpen}
        onClose={() => setIsDecryptModalOpen(false)}
      />
    </div>
  );
}
