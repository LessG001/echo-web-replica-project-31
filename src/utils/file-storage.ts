
import { v4 as uuidv4 } from "uuid";
import { getCurrentUserEmail } from './auth';
import { logInfo, logError, logSecurity, LogCategory } from './audit-logger';

export interface FileInfo {
  id: string;
  name: string;
  extension: string;
  size: string;
  tags: string[];
  timestamp: string;
  isFavorite?: boolean;
  isShared?: boolean;
  isEncrypted?: boolean;
  type?: string;
  created: string;
  modified: string;
  createdBy: string;
  modifiedBy: string;
  checksum?: string;
  encryptionData?: {
    algorithm: string;
    encryptionKey: string;
    iv: string;
  };
}

interface FileStorage {
  files: FileInfo[];
}

// In-memory file storage (in a real app, this would be a database)
let fileStorage: FileStorage = { files: [] };

// Load files from localStorage
const loadFiles = (): void => {
  const storedFiles = localStorage.getItem('fileStorage');
  if (storedFiles) {
    fileStorage = JSON.parse(storedFiles);
  }
};

// Save files to localStorage
const saveFiles = (): void => {
  localStorage.setItem('fileStorage', JSON.stringify(fileStorage));
};

// Initialize by loading files
loadFiles();

// Add a file to storage
export const addFile = (file: FileInfo): void => {
  fileStorage.files.unshift(file); // Add to beginning for reverse chronological order
  saveFiles();
  
  logInfo(LogCategory.FILE, `File added: ${file.name}`, {
    fileId: file.id,
    fileName: file.name,
    encrypted: file.isEncrypted
  });
};

// Get all files
export const getAllFiles = (): FileInfo[] => {
  return fileStorage.files;
};

// Get file by ID
export const getFileById = (id: string): FileInfo | undefined => {
  return fileStorage.files.find(file => file.id === id);
};

// Update file
export const updateFile = (id: string, updates: Partial<FileInfo>): boolean => {
  const fileIndex = fileStorage.files.findIndex(file => file.id === id);
  
  if (fileIndex === -1) {
    logError(LogCategory.FILE, `Failed to update file: File not found`, { fileId: id });
    return false;
  }
  
  fileStorage.files[fileIndex] = { ...fileStorage.files[fileIndex], ...updates };
  saveFiles();
  
  logInfo(LogCategory.FILE, `File updated: ${fileStorage.files[fileIndex].name}`, {
    fileId: id,
    fileName: fileStorage.files[fileIndex].name
  });
  
  return true;
};

// Delete file
export const deleteFile = (id: string): boolean => {
  const fileIndex = fileStorage.files.findIndex(file => file.id === id);
  
  if (fileIndex === -1) {
    logError(LogCategory.FILE, `Failed to delete file: File not found`, { fileId: id });
    return false;
  }
  
  const deletedFile = fileStorage.files[fileIndex];
  fileStorage.files.splice(fileIndex, 1);
  saveFiles();
  
  // Also remove file content from localStorage
  localStorage.removeItem(`file_${id}`);
  
  logInfo(LogCategory.FILE, `File deleted: ${deletedFile.name}`, {
    fileId: id,
    fileName: deletedFile.name
  });
  
  return true;
};

// Toggle favorite status
export const toggleFavorite = (id: string): boolean => {
  const fileIndex = fileStorage.files.findIndex(file => file.id === id);
  
  if (fileIndex === -1) return false;
  
  fileStorage.files[fileIndex].isFavorite = !fileStorage.files[fileIndex].isFavorite;
  saveFiles();
  
  return true;
};

// Share a file
export const shareFile = (id: string, recipient: string): boolean => {
  const fileIndex = fileStorage.files.findIndex(file => file.id === id);
  
  if (fileIndex === -1) return false;
  
  fileStorage.files[fileIndex].isShared = true;
  saveFiles();
  
  logSecurity(LogCategory.FILE, `File shared: ${fileStorage.files[fileIndex].name}`, {
    fileId: id,
    fileName: fileStorage.files[fileIndex].name,
    recipient
  });
  
  return true;
};

// Store file content
export const storeFileContent = (id: string, content: string): void => {
  localStorage.setItem(`file_${id}`, content);
};

// Get file content
export const getFileContent = (id: string): string | null => {
  return localStorage.getItem(`file_${id}`);
};

// Format a timestamp for display
export const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === now.toDateString()) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  else return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

// Generate a new file ID
export const generateFileId = (): string => {
  return `file-${uuidv4()}`;
};

// Check if a user has access to a file's encryption key
export const hasAccessToEncryptionKey = (fileId: string, userEmail: string): boolean => {
  const file = getFileById(fileId);
  
  if (!file || !file.isEncrypted) return false;
  
  // In a real app, this would check access permissions
  // For this demo, the file creator always has access
  return file.createdBy === userEmail;
};

// Get filtered files
export const getFilteredFiles = (
  searchQuery: string = '',
  filterType?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): FileInfo[] => {
  let filteredFiles = [...fileStorage.files];
  
  // Apply search query
  if (searchQuery) {
    filteredFiles = filteredFiles.filter(file => 
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }
  
  // Apply filter
  if (filterType) {
    switch (filterType) {
      case 'documents':
        filteredFiles = filteredFiles.filter(file => 
          file.type?.includes('document') || 
          file.type?.includes('pdf') || 
          file.extension === 'pdf' ||
          file.extension === 'docx' ||
          file.extension === 'txt'
        );
        break;
      case 'images':
        filteredFiles = filteredFiles.filter(file => 
          file.type?.startsWith('image/') || 
          ['jpg', 'jpeg', 'png', 'gif'].includes(file.extension)
        );
        break;
      case 'videos':
        filteredFiles = filteredFiles.filter(file => 
          file.type?.startsWith('video/') || 
          ['mp4', 'avi', 'mov'].includes(file.extension)
        );
        break;
      case 'encrypted':
        filteredFiles = filteredFiles.filter(file => file.isEncrypted);
        break;
      case 'favorites':
        filteredFiles = filteredFiles.filter(file => file.isFavorite);
        break;
      case 'shared':
        filteredFiles = filteredFiles.filter(file => file.isShared);
        break;
    }
  }
  
  // Apply sorting
  if (sortBy) {
    filteredFiles.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(b.modified).getTime() - new Date(a.modified).getTime();
          break;
        case 'size':
          comparison = parseFloat(a.size) - parseFloat(b.size);
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }
  
  return filteredFiles;
};

// Initialize with sample files if none exist
export const initializeSampleFiles = (): void => {
  if (fileStorage.files.length === 0) {
    // Sample files can be added here
  }
};
