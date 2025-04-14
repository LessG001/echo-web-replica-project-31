
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Logo } from "@/components/logo";
import { NavLink } from "@/components/nav-link";
import { Button } from "@/components/ui/button";
import { NavIcons } from "@/components/ui/icons";
import { Progress } from "@/components/ui/progress";

interface SidebarProps {
  storageUsed: number;
  storageTotal: number;
  onUploadClick: () => void;
}

export function Sidebar({ storageUsed, storageTotal, onUploadClick }: SidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  
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
        <NavLink 
          to="/dashboard"
          label="All Files"
          icon={NavIcons.AllFiles}
          active={currentPath === "/dashboard"}
        />
        <NavLink 
          to="/recent"
          label="Recent"
          icon={NavIcons.Recent}
          active={currentPath === "/recent"}
        />
        <NavLink 
          to="/favorites"
          label="Favorites"
          icon={NavIcons.Favorites}
          active={currentPath === "/favorites"}
        />
        <NavLink 
          to="/shared"
          label="Shared"
          icon={NavIcons.Shared}
          active={currentPath === "/shared"}
        />
        <NavLink 
          to="/encrypted"
          label="Encrypted"
          icon={NavIcons.Encrypted}
          active={currentPath === "/encrypted"}
        />
        <NavLink 
          to="/tags"
          label="Tags"
          icon={NavIcons.Tags}
          active={currentPath === "/tags"}
        />
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
