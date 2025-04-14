
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NavIcons } from "@/components/ui/icons";

interface FileToolbarProps {
  onSearch: (query: string) => void;
  onFilter: () => void;
  onSort: () => void;
}

export function FileToolbar({ onSearch, onFilter, onSort }: FileToolbarProps) {
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
        <Button variant="outline" size="icon" onClick={onFilter}>
          <NavIcons.Filter className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onSort}>
          <NavIcons.Sort className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon">
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
        </Button>
      </div>
    </div>
  );
}
