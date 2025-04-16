
import { v4 as uuidv4 } from 'uuid';

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
export const getFiles = () => {
  const filesData = localStorage.getItem('secure_vault_files');
  return filesData ? JSON.parse(filesData) : [];
};

// Add a file to localStorage
export const addFile = (file: any) => {
  const files = getFiles();
  files.unshift(file); // Add to beginning of array
  localStorage.setItem('secure_vault_files', JSON.stringify(files));
  return file;
};

// Get a file by ID
export const getFileById = (id: string) => {
  const files = getFiles();
  return files.find((file: any) => file.id === id) || null;
};

// Update a file
export const updateFile = (id: string, updates: any) => {
  const files = getFiles();
  const index = files.findIndex((file: any) => file.id === id);
  
  if (index !== -1) {
    files[index] = { ...files[index], ...updates };
    localStorage.setItem('secure_vault_files', JSON.stringify(files));
    return files[index];
  }
  
  return null;
};

// Delete a file
export const deleteFile = (id: string) => {
  const files = getFiles();
  const newFiles = files.filter((file: any) => file.id !== id);
  
  if (newFiles.length !== files.length) {
    localStorage.setItem('secure_vault_files', JSON.stringify(newFiles));
    // Also delete the actual file content
    localStorage.removeItem(`file_${id}`);
    return true;
  }
  
  return false;
};

// Get favorite files
export const getFavoriteFiles = () => {
  const files = getFiles();
  return files.filter((file: any) => file.isFavorite);
};

// Toggle favorite status
export const toggleFavorite = (id: string) => {
  const files = getFiles();
  const index = files.findIndex((file: any) => file.id === id);
  
  if (index !== -1) {
    files[index].isFavorite = !files[index].isFavorite;
    localStorage.setItem('secure_vault_files', JSON.stringify(files));
    return files[index];
  }
  
  return null;
};

// Get recently modified files
export const getRecentFiles = (limit = 10) => {
  const files = getFiles();
  return files.slice(0, limit);
};

// Get encrypted files
export const getEncryptedFiles = () => {
  const files = getFiles();
  return files.filter((file: any) => file.isEncrypted);
};

// Get shared files
export const getSharedFiles = () => {
  const files = getFiles();
  return files.filter((file: any) => file.isShared);
};
