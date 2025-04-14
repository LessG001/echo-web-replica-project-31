
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavIcons } from "@/components/ui/icons";
import { FileDetail } from "@/components/file-detail";
import { getFileById } from "@/data/files";

export default function FileDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const file = id ? getFileById(id) : null;
  
  if (!file) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="mr-4 flex items-center" 
            onClick={() => navigate("/dashboard")}
          >
            <NavIcons.Back className="h-4 w-4 mr-2" />
            Back to Files
          </Button>
        </div>
        
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <h2 className="text-xl font-semibold mb-2">File Not Found</h2>
          <p className="text-muted-foreground">The file you're looking for doesn't exist or has been moved.</p>
          <Button 
            className="mt-4" 
            onClick={() => navigate("/dashboard")}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  const handleDownload = () => {
    console.log(`Downloading file: ${file.name}`);
  };
  
  const handleShare = () => {
    console.log(`Sharing file: ${file.name}`);
  };
  
  const handleDelete = () => {
    console.log(`Deleting file: ${file.name}`);
    navigate("/dashboard");
  };
  
  return (
    <div className="flex-1 p-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="mr-4 flex items-center" 
          onClick={() => navigate("/dashboard")}
        >
          <NavIcons.Back className="h-4 w-4 mr-2" />
          Back to Files
        </Button>
      </div>
      
      <FileDetail 
        file={file}
        onDownload={handleDownload}
        onShare={handleShare}
        onDelete={handleDelete}
      />
    </div>
  );
}
