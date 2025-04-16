import { v4 as uuidv4 } from 'uuid';
import { FileInfo } from '@/types/file';
import { downloadFile as downloadFileUtil } from '@/utils/encryption';

// Helper function to generate a unique file ID
export const generateFileId = (): string => {
  return `file-${uuidv4().slice(0, 8)}`;
};

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  else return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

// Helper function to format timestamp
export const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // If it's today
  if (date.toDateString() === now.toDateString()) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // If it's yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // If it's within this year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + 
           ` at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // For older dates
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Get files from localStorage
export const getFiles = (): FileInfo[] => {
  const filesData = localStorage.getItem('secure_vault_files');
  return filesData ? JSON.parse(filesData) : [];
};

// Alias for getFiles for better semantics
export const getAllFiles = getFiles;

// Add a file to localStorage
export const addFile = (file: FileInfo): FileInfo => {
  const files = getFiles();
  files.unshift(file); // Add to beginning of array
  localStorage.setItem('secure_vault_files', JSON.stringify(files));
  return file;
};

// Save actual file content to localStorage
export const saveFileContent = (fileId: string, content: Blob | File): void => {
  // Convert the file to a data URL
  const reader = new FileReader();
  reader.onload = () => {
    localStorage.setItem(`file_content_${fileId}`, reader.result as string);
    console.log(`Saved file content for ${fileId}`);
  };
  reader.readAsDataURL(content);
};

// Get file content from localStorage
export const getFileContent = (fileId: string): Promise<File | null> => {
  return new Promise((resolve) => {
    const dataUrl = localStorage.getItem(`file_content_${fileId}`);
    if (!dataUrl) {
      console.error(`No content found for file ${fileId}`);
      resolve(null);
      return;
    }
    
    const fileInfo = getFileById(fileId);
    if (!fileInfo) {
      console.error(`No file info found for ${fileId}`);
      resolve(null);
      return;
    }
    
    // Convert data URL to Blob
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeType = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([ab], { type: mimeType });
    const file = new File([blob], fileInfo.name, { type: mimeType });
    resolve(file);
  });
};

// Get a file by ID
export const getFileById = (id: string): FileInfo | null => {
  const files = getFiles();
  return files.find((file: FileInfo) => file.id === id) || null;
};

// Update a file
export const updateFile = (id: string, updates: Partial<FileInfo>): FileInfo | null => {
  const files = getFiles();
  const index = files.findIndex((file: FileInfo) => file.id === id);
  
  if (index !== -1) {
    files[index] = { ...files[index], ...updates };
    localStorage.setItem('secure_vault_files', JSON.stringify(files));
    return files[index];
  }
  
  return null;
};

// Delete a file
export const deleteFile = (id: string): boolean => {
  const files = getFiles();
  const newFiles = files.filter((file: FileInfo) => file.id !== id);
  
  if (newFiles.length !== files.length) {
    localStorage.setItem('secure_vault_files', JSON.stringify(newFiles));
    // Also delete the actual file content
    localStorage.removeItem(`file_content_${id}`);
    return true;
  }
  
  return false;
};

// Export downloadFile function to be used in FileDetail.tsx
export const downloadFile = async (fileId: string): Promise<void> => {
  try {
    const fileInfo = getFileById(fileId);
    if (!fileInfo) {
      throw new Error(`File with ID ${fileId} not found`);
    }
    
    const fileContent = await getFileContent(fileId);
    if (!fileContent) {
      throw new Error(`Content for file ${fileId} not found`);
    }
    
    // Use the downloadFile utility from encryption.ts
    downloadFileUtil(fileContent);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

// Get favorite files
export const getFavoriteFiles = (): FileInfo[] => {
  const files = getFiles();
  return files.filter((file: FileInfo) => file.isFavorite);
};

// Toggle favorite status
export const toggleFavorite = (id: string): FileInfo | null => {
  const files = getFiles();
  const index = files.findIndex((file: FileInfo) => file.id === id);
  
  if (index !== -1) {
    files[index].isFavorite = !files[index].isFavorite;
    localStorage.setItem('secure_vault_files', JSON.stringify(files));
    return files[index];
  }
  
  return null;
};

// Get recently modified files
export const getRecentFiles = (limit = 10): FileInfo[] => {
  const files = getFiles();
  return files.slice(0, limit);
};

// Get encrypted files
export const getEncryptedFiles = (): FileInfo[] => {
  const files = getFiles();
  return files.filter((file: FileInfo) => file.isEncrypted);
};

// Get shared files
export const getSharedFiles = (): FileInfo[] => {
  const files = getFiles();
  return files.filter((file: FileInfo) => file.isShared);
};

// Function to filter files by search query and category
export const getFilteredFiles = (
  query: string = "", 
  category?: "favorites" | "shared" | "encrypted",
  sortBy: "name" | "date" | "size" = "name",
  sortOrder: "asc" | "desc" = "asc"
): FileInfo[] => {
  let files = getFiles();
  
  // Apply category filters
  if (category === "favorites") {
    files = files.filter(file => file.isFavorite);
  } else if (category === "shared") {
    files = files.filter(file => file.isShared);
  } else if (category === "encrypted") {
    files = files.filter(file => file.isEncrypted);
  }
  
  // Apply search query filter
  if (query) {
    files = files.filter(file => 
      file.name.toLowerCase().includes(query.toLowerCase()) ||
      file.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }
  
  // Apply sorting
  files.sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === "date") {
      comparison = new Date(a.modified).getTime() - new Date(b.modified).getTime();
    } else if (sortBy === "size") {
      const sizeA = parseFloat(a.size);
      const sizeB = parseFloat(b.size);
      comparison = sizeA - sizeB;
    }
    
    return sortOrder === "asc" ? comparison : -comparison;
  });
  
  return files;
};
