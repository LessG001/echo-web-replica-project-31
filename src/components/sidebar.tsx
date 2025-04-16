
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/logo";
import { NavLink } from "@/components/nav-link";
import { Button } from "@/components/ui/button";
import { NavIcons } from "@/components/ui/icons";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Unlock, History, FileText } from "lucide-react";

interface SidebarProps {
  storageUsed: number;
  storageTotal: number;
  onUploadClick: () => void;
  onDecryptClick: () => void;
}

export function Sidebar({ storageUsed, storageTotal, onUploadClick, onDecryptClick }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { toast } = useToast();
  
  const handleNavClick = (path: string, label: string) => {
    navigate(path);
  };
  
  return (
    <div className="w-60 h-screen border-r border-border/40 flex flex-col p-4">
      <Logo className="mb-8 px-3" />
      
      <div className="space-y-2 mb-6">
        <Button 
          onClick={onUploadClick}
          className="w-full"
        >
          <NavIcons.Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
        
        <Button 
          variant="outline"
          onClick={onDecryptClick}
          className="w-full"
        >
          <Unlock className="h-4 w-4 mr-2" />
          Decrypt File
        </Button>
      </div>
      
      <div className="space-y-1 mb-6">
        <button 
          className={`nav-item ${currentPath === "/dashboard" ? "active" : ""}`}
          onClick={() => handleNavClick("/dashboard", "All Files")}
        >
          <NavIcons.AllFiles className="h-5 w-5" />
          <span>All Files</span>
        </button>
        
        <button 
          className={`nav-item ${currentPath === "/recent" ? "active" : ""}`}
          onClick={() => handleNavClick("/recent", "Recent")}
        >
          <NavIcons.Recent className="h-5 w-5" />
          <span>Recent</span>
        </button>
        
        <button 
          className={`nav-item ${currentPath === "/favorites" ? "active" : ""}`}
          onClick={() => handleNavClick("/favorites", "Favorites")}
        >
          <NavIcons.Favorites className="h-5 w-5" />
          <span>Favorites</span>
        </button>
        
        <button 
          className={`nav-item ${currentPath === "/shared" ? "active" : ""}`}
          onClick={() => handleNavClick("/shared", "Shared")}
        >
          <NavIcons.Shared className="h-5 w-5" />
          <span>Shared</span>
        </button>
        
        <button 
          className={`nav-item ${currentPath === "/encrypted" ? "active" : ""}`}
          onClick={() => handleNavClick("/encrypted", "Encrypted")}
        >
          <NavIcons.Encrypted className="h-5 w-5" />
          <span>Encrypted</span>
        </button>
        
        <button 
          className={`nav-item ${currentPath === "/tags" ? "active" : ""}`}
          onClick={() => handleNavClick("/tags", "Tags")}
        >
          <NavIcons.Tags className="h-5 w-5" />
          <span>Tags</span>
        </button>
      </div>
      
      <div className="space-y-1 mb-6">
        <h3 className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Security
        </h3>
        <button 
          className={`nav-item ${currentPath === "/audit-logs" ? "active" : ""}`}
          onClick={() => handleNavClick("/audit-logs", "Audit Logs")}
        >
          <FileText className="h-5 w-5" />
          <span>Audit Logs</span>
        </button>
        <button 
          className={`nav-item ${currentPath === "/profile" ? "active" : ""}`}
          onClick={() => handleNavClick("/profile", "Profile")}
        >
          <NavIcons.Profile className="h-5 w-5" />
          <span>Profile</span>
        </button>
      </div>
      
      <div className="mt-auto">
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="text-sm font-medium flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              Storage
            </span>
          </div>
          <Progress value={(storageUsed / storageTotal) * 100} className="h-1" />
          <div className="text-xs text-muted-foreground">
            {storageUsed} GB of {storageTotal} GB used
          </div>
        </div>
      </div>
    </div>
  );
}
