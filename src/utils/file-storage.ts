
import { v4 as uuidv4 } from "uuid";
import { getCurrentUserEmail } from './auth';
import { logInfo, logError, logSecurity, LogCategory } from './audit-logger';
import { arrayBufferToBase64, base64ToArrayBuffer } from './encryption';
import * as fs from 'fs';

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

// Directory for file storage
const DATA_DIR = './data';
const FILE_STORAGE_PATH = `${DATA_DIR}/fileStorage.json`;
const FILE_CONTENT_DIR = `${DATA_DIR}/files`;

// Ensure data directories exist
const ensureDirectoriesExist = (): void => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    if (!fs.existsSync(FILE_CONTENT_DIR)) {
      fs.mkdirSync(FILE_CONTENT_DIR, { recursive: true });
    }
  } catch (error) {
    console.error("Failed to create data directories:", error);
    // Fallback to localStorage if file system access fails
  }
};

// Load files from storage
const loadFiles = (): void => {
  try {
    ensureDirectoriesExist();
    
    // Try filesystem first
    if (fs.existsSync(FILE_STORAGE_PATH)) {
      const data = fs.readFileSync(FILE_STORAGE_PATH, 'utf8');
      fileStorage = JSON.parse(data);
      return;
    }
  } catch (error) {
    console.error("Failed to load file storage from filesystem:", error);
  }
  
  // Fallback to localStorage
  try {
    const storedFiles = localStorage.getItem('fileStorage');
    if (storedFiles) {
      fileStorage = JSON.parse(storedFiles);
    }
  } catch (error) {
    console.error("Failed to load file storage from localStorage:", error);
  }
};

// Save files to storage
const saveFiles = (): void => {
  try {
    ensureDirectoriesExist();
    
    // Try filesystem first
    fs.writeFileSync(FILE_STORAGE_PATH, JSON.stringify(fileStorage, null, 2));
  } catch (error) {
    console.error("Failed to save file storage to filesystem:", error);
    
    // Fallback to localStorage
    try {
      localStorage.setItem('fileStorage', JSON.stringify(fileStorage));
    } catch (storageError) {
      console.error("Failed to save to localStorage:", storageError);
    }
  }
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
  // Ensure we have the latest data
  loadFiles();
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
  
  // Also remove file content
  try {
    const filePath = `${FILE_CONTENT_DIR}/${id}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    } else {
      // Fallback to localStorage
      localStorage.removeItem(`file_${id}`);
    }
  } catch (error) {
    console.error("Failed to delete file content:", error);
    // Still try localStorage as fallback
    localStorage.removeItem(`file_${id}`);
  }
  
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
export const storeFileContent = (id: string, content: string | ArrayBuffer): void => {
  try {
    ensureDirectoriesExist();
    
    // For ArrayBuffer, convert to base64 string
    const contentToStore = content instanceof ArrayBuffer 
      ? arrayBufferToBase64(content) 
      : content;
    
    // Try filesystem first
    const filePath = `${FILE_CONTENT_DIR}/${id}`;
    fs.writeFileSync(filePath, contentToStore);
  } catch (error) {
    console.error("Failed to store file content to filesystem:", error);
    
    // Fallback to localStorage
    try {
      // For saving to localStorage, we need a string
      const contentToStore = content instanceof ArrayBuffer 
        ? arrayBufferToBase64(content) 
        : content;
        
      localStorage.setItem(`file_${id}`, contentToStore);
    } catch (storageError) {
      console.error("Failed to store in localStorage:", storageError);
    }
  }
};

// Get file content
export const getFileContent = (id: string): string | ArrayBuffer | null => {
  try {
    ensureDirectoriesExist();
    
    // Try filesystem first
    const filePath = `${FILE_CONTENT_DIR}/${id}`;
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
  } catch (error) {
    console.error("Failed to read file content from filesystem:", error);
  }
  
  // Fallback to localStorage
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
  // Make sure we have the latest data
  loadFiles();
  
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
