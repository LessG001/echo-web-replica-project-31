
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NavIcons } from "@/components/ui/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FileToolbarProps {
  onSearch: (query: string) => void;
  onFilter: () => void;
  onSort: () => void;
  onViewChange: (view: "grid" | "list") => void;
  currentView: "grid" | "list";
}

export function FileToolbar({ 
  onSearch, 
  onFilter, 
  onSort, 
  onViewChange,
  currentView = "grid" 
}: FileToolbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };
  
  return (
    <div className="flex items-center justify-between mb-6">
      <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
        <NavIcons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card border-border/40"
        />
      </form>
      
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <NavIcons.Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onFilter()}>All Files</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilter()}>Documents</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilter()}>Images</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilter()}>Videos</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <NavIcons.Sort className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onSort()}>Name (A-Z)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSort()}>Name (Z-A)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSort()}>Date (Newest)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSort()}>Date (Oldest)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSort()}>Size (Largest)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSort()}>Size (Smallest)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => onViewChange(currentView === "grid" ? "list" : "grid")}
        >
          {currentView === "grid" ? (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          ) : (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="12" x2="3" y2="12" />
              <line x1="21" y1="18" x2="3" y2="18" />
            </svg>
          )}
        </Button>
      </div>
    </div>
  );
}
