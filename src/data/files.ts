
import { FileInfo } from "@/components/file-card";

export const mockFiles: FileInfo[] = [
  {
    id: "file-0",
    name: "File-0.jpg",
    extension: "jpg",
    size: "100 KB",
    tags: ["project"],
    timestamp: "less than a minute ago",
    isFavorite: false,
    isShared: false
  },
  {
    id: "file-1",
    name: "File-1.txt",
    extension: "txt",
    size: "10 MB",
    tags: ["tax", "work"],
    timestamp: "less than a minute ago",
    isFavorite: false,
    isShared: false
  },
  {
    id: "file-2",
    name: "File-2.jpg",
    extension: "jpg",
    size: "1.5 MB",
    tags: [],
    timestamp: "less than a minute ago",
    isFavorite: false,
    isShared: false
  },
  {
    id: "file-3",
    name: "File-3.xlsx",
    extension: "xlsx",
    size: "25 MB",
    tags: [],
    timestamp: "less than a minute ago",
    isFavorite: false,
    isShared: true
  },
  {
    id: "file-4",
    name: "File-4.xlsx",
    extension: "xlsx",
    size: "100 KB",
    tags: ["project"],
    timestamp: "less than a minute ago",
    isFavorite: false,
    isShared: false
  },
  {
    id: "file-5",
    name: "File-5.png",
    extension: "png",
    size: "3 MB",
    tags: ["backup"],
    timestamp: "less than a minute ago",
    isFavorite: false,
    isShared: false
  },
  {
    id: "file-6",
    name: "File-6.txt",
    extension: "txt",
    size: "3 MB",
    tags: [],
    timestamp: "less than a minute ago",
    isFavorite: false,
    isShared: false
  },
  {
    id: "file-7",
    name: "File-7.jpg",
    extension: "jpg",
    size: "1.5 MB",
    tags: ["work"],
    timestamp: "less than a minute ago",
    isFavorite: false,
    isShared: false
  },
  {
    id: "file-8",
    name: "File-8.xlsx",
    extension: "xlsx",
    size: "10 MB",
    tags: ["important"],
    timestamp: "less than a minute ago",
    isFavorite: true,
    isShared: false
  },
  {
    id: "file-9",
    name: "File-9.zip",
    extension: "zip",
    size: "100 KB",
    tags: ["personal", "work"],
    timestamp: "less than a minute ago",
    isFavorite: false,
    isShared: false
  },
  {
    id: "file-10",
    name: "File-10.pdf",
    extension: "pdf",
    size: "10 MB",
    tags: [],
    timestamp: "less than a minute ago",
    isFavorite: true,
    isShared: false
  },
  {
    id: "file-11",
    name: "File-11.txt",
    extension: "txt",
    size: "25 MB",
    tags: [],
    timestamp: "less than a minute ago",
    isFavorite: false,
    isShared: true
  },
  {
    id: "file-12",
    name: "File-12.zip",
    extension: "zip",
    size: "3 MB",
    tags: ["important"],
    timestamp: "less than a minute ago",
    isFavorite: false,
    isShared: false
  },
  {
    id: "file-13",
    name: "File-13.jpg",
    extension: "jpg",
    size: "10 MB",
    tags: [],
    timestamp: "less than a minute ago",
    isFavorite: false,
    isShared: false
  },
  {
    id: "file-14",
    name: "File-14.xlsx",
    extension: "xlsx",
    size: "10 MB",
    tags: [],
    timestamp: "less than a minute ago",
    isFavorite: false,
    isShared: false
  },
  {
    id: "file-15",
    name: "File-15.xlsx",
    extension: "xlsx",
    size: "100 KB",
    tags: ["important"],
    timestamp: "less than a minute ago",
    isFavorite: false,
    isShared: false
  }
];

export const getFileById = (id: string) => {
  const file = mockFiles.find(file => file.id === id);
  
  if (!file) return null;
  
  return {
    ...file,
    type: file.extension.toUpperCase(),
    created: "less than a minute ago",
    modified: "less than a minute ago",
    createdBy: "Demo User",
    modifiedBy: "Demo User",
    isEncrypted: true,
    checksum: "ceb292e58d800fc8056a3ae8ab929fb9e143b6a3e916a54661ef9e8e8d647f53"
  };
};
