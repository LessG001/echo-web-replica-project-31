
export interface FileInfo {
  id: string;
  name: string;
  extension: string;
  size: string; // Using string for formatted file size display
  type?: string;
  created: string;
  modified: string;
  createdBy?: string;
  modifiedBy?: string;
  isFavorite: boolean;
  isShared: boolean;
  isEncrypted: boolean;
  tags: string[];
  timestamp: string; // Formatted timestamp for display
  checksum?: string;
  encryptionData?: EncryptionData;
  previewUrl?: string;
}

export interface EncryptionData {
  algorithm: string;
  encryptionKey?: string;
  iv: string;
  checksum: string;
}
