
import {
  File,
  FileText,
  FileImage,
  FileSpreadsheet,
  FileBox,
  Archive,
  Clock,
  Star,
  Share2,
  Lock,
  Tag,
  Shield,
  Upload,
  Download,
  Trash2,
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  X,
  ChevronLeft,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type FileType = 
  | "jpg" 
  | "jpeg" 
  | "png" 
  | "pdf" 
  | "txt" 
  | "xlsx" 
  | "zip" 
  | "default";

export const getIconByExtension = (extension: string) => {
  switch (extension.toLowerCase()) {
    case "jpg":
    case "jpeg":
    case "png":
      return FileImage;
    case "pdf":
      return FileBox;
    case "txt":
      return FileText;
    case "xlsx":
      return FileSpreadsheet;
    case "zip":
      return Archive;
    default:
      return File;
  }
};

export const getColorByExtension = (extension: string): string => {
  switch (extension.toLowerCase()) {
    case "jpg":
    case "jpeg":
    case "png":
      return "text-purple-500";
    case "pdf":
      return "text-red-500";
    case "txt":
      return "text-gray-500";
    case "xlsx":
      return "text-green-500";
    case "zip":
      return "text-yellow-500";
    default:
      return "text-blue-500";
  }
};

export const FileIcon = ({ 
  extension, 
  className,
  size = 24
}: { 
  extension: string;
  className?: string;
  size?: number;
}) => {
  const Icon = getIconByExtension(extension);
  const colorClass = getColorByExtension(extension);
  
  return <Icon className={cn(colorClass, className)} size={size} />;
};

export const NavIcons = {
  AllFiles: LayoutGrid,
  Recent: Clock,
  Favorites: Star,
  Shared: Share2,
  Encrypted: Lock,
  Tags: Tag,
  Shield: Shield,
  Upload: Upload,
  Download: Download,
  Delete: Trash2,
  Search: Search,
  Filter: Filter,
  Sort: ArrowUpDown,
  Close: X,
  Back: ChevronLeft,
  ArrowRight: ArrowRight
};
