
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/logo";
import { NavLink } from "@/components/nav-link";
import { Button } from "@/components/ui/button";
import { NavIcons } from "@/components/ui/icons";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  storageUsed: number;
  storageTotal: number;
  onUploadClick: () => void;
}

export function Sidebar({ storageUsed, storageTotal, onUploadClick }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { toast } = useToast();
  
  const handleNavClick = (path: string, label: string) => {
    if (path !== "/dashboard") {
      toast({
        description: `Navigated to ${label}`,
      });
    }
    navigate(path);
  };
  
  return (
    <div className="w-60 h-screen border-r border-border/40 flex flex-col p-4">
      <Logo className="mb-8 px-3" />
      
      <Button 
        onClick={onUploadClick}
        className="w-full mb-6"
      >
        <NavIcons.Upload className="h-4 w-4 mr-2" />
        Upload
      </Button>
      
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
