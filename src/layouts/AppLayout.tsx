
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { UploadModal, UploadFileData } from "@/components/upload-modal";

export default function AppLayout() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  const handleUpload = (fileData: UploadFileData) => {
    console.log(`Uploading file: ${fileData.file.name}, Encrypt: ${fileData.encrypt}`);
    // Implement file upload logic
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header user={{ initials: "DU" }} />
      
      <div className="flex flex-1">
        <Sidebar 
          storageUsed={3.8} 
          storageTotal={10} 
          onUploadClick={() => setIsUploadModalOpen(true)} 
        />
        
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
}
