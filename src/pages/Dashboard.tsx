
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { FileGrid } from "@/components/file-grid";
import { FileToolbar } from "@/components/file-toolbar";
import { UploadModal, UploadFileData } from "@/components/upload-modal";
import { DecryptionModal } from "@/components/decryption-modal";
import { mockFiles } from "@/data/files";
import { Button } from "@/components/ui/button";
import { NavIcons } from "@/components/ui/icons";
import { calculateChecksum } from "@/utils/encryption";

export default function Dashboard() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDecryptModalOpen, setIsDecryptModalOpen] = useState(false);
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
  
  const handleUpload = async (fileData: UploadFileData) => {
    const { file, encrypt, encryptionData } = fileData;
    
    // Create file tags based on type and encryption status
    const fileType = file.type.split('/')[0] || 'document';
    const tags = [fileType];
    if (encrypt) tags.push('encrypted');
    
    // Generate additional file metadata
    const now = new Date();
    const checksum = encryptionData?.checksum || await calculateChecksum(file);
    
    const newFile = {
      id: `file-${Date.now()}`,
      name: file.name,
      extension: file.name.split('.').pop() || '',
      size: `${(file.size / 1024).toFixed(2)} KB`,
      tags: tags,
      timestamp: "less than a minute ago",
      isFavorite: false,
      isShared: false,
      type: file.type || 'application/octet-stream',
      created: now.toLocaleString(),
      modified: now.toLocaleString(),
      createdBy: "Current User",
      modifiedBy: "Current User",
      isEncrypted: encrypt,
      checksum: checksum,
      // Store encryption data in file object for later decryption
      encryptionData: encrypt && encryptionData ? {
        algorithm: encryptionData.algorithm,
        encryptionKey: encryptionData.encryptionKey,
        iv: encryptionData.iv
      } : undefined
    };
    
    // Save actual file in localStorage for demo purposes
    try {
      const fileReader = new FileReader();
      fileReader.onload = function(e) {
        const base64Content = e.target?.result;
        localStorage.setItem(`file_${newFile.id}`, base64Content as string);
      };
      fileReader.readAsDataURL(file);
    } catch (err) {
      console.error("Failed to store file:", err);
    }
    
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
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsDecryptModalOpen(true)}
          >
            <NavIcons.Unlock className="h-4 w-4 mr-2" />
            Decrypt File
          </Button>
          <Button onClick={() => setIsUploadModalOpen(true)}>
            <NavIcons.Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
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
      
      <DecryptionModal
        isOpen={isDecryptModalOpen}
        onClose={() => setIsDecryptModalOpen(false)}
      />
    </div>
  );
}
