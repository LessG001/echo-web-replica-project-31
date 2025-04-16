
import { useState, useEffect } from "react";
import { FileGrid } from "@/components/file-grid";
import { FileToolbar } from "@/components/file-toolbar";
import { getFiles, FileInfo } from "@/utils/file-storage";
import { toast } from "sonner";
import { isAuthenticated } from "@/utils/auth";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function TagsPage() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<"grid" | "list">("grid");
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    
    // Load all files
    const allFiles = getFiles();
    
    // Extract all unique tags
    const tagsMap = new Map<string, number>();
    allFiles.forEach(file => {
      file.tags.forEach(tag => {
        const count = tagsMap.get(tag) || 0;
        tagsMap.set(tag, count + 1);
      });
    });
    
    // Convert to array and sort by count
    const sortedTags = [...tagsMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
    
    setAllTags(sortedTags);
    setFiles(allFiles);
  }, [navigate]);
  
  const handleTagClick = (tag: string) => {
    // If already selected, clear selection
    if (selectedTag === tag) {
      setSelectedTag(null);
      setFiles(getFiles());
    } else {
      setSelectedTag(tag);
      const filteredFiles = getFiles().filter(file => 
        file.tags.includes(tag)
      );
      setFiles(filteredFiles);
    }
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    let filteredFiles = getFiles();
    
    // Apply tag filter if selected
    if (selectedTag) {
      filteredFiles = filteredFiles.filter(file => 
        file.tags.includes(selectedTag)
      );
    }
    
    // Apply search filter
    if (query) {
      filteredFiles = filteredFiles.filter(file => 
        file.name.toLowerCase().includes(query.toLowerCase()) ||
        file.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
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
        <h1 className="text-2xl font-bold">Tags</h1>
      </div>
      
      <div className="mb-6">
        <div className="bg-card border border-border/40 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Browse by Tag</h2>
          <div className="flex flex-wrap gap-2">
            {allTags.length === 0 ? (
              <p className="text-muted-foreground">No tags found</p>
            ) : (
              allTags.map(tag => (
                <Badge 
                  key={tag} 
                  variant={selectedTag === tag ? "default" : "secondary"}
                  className="cursor-pointer text-sm px-3 py-1"
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </Badge>
              ))
            )}
          </div>
        </div>
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
          <h3 className="text-lg font-medium mb-2">No files found</h3>
          <p className="text-muted-foreground">
            {selectedTag 
              ? `No files with tag "${selectedTag}" found`
              : "No files match your search criteria"
            }
          </p>
        </div>
      ) : (
        <div>
          {selectedTag && (
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">
                Files tagged with "{selectedTag}"
              </h3>
            </div>
          )}
          <FileGrid files={files} />
        </div>
      )}
    </div>
  );
}
