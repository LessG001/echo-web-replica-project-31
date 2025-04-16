
import CryptoJS from 'crypto-js';

/**
 * Enhanced encryption and decryption utilities
 */

interface EncryptionResult {
  encryptedFile: File;
  algorithm: string;
  encryptionKey: string;
  iv: string;
  checksum: string;
}

interface DecryptionResult {
  success: boolean;
  file?: File;
  error?: string;
}

/**
 * Encrypts a file using AES-256 algorithm
 * @param file File to encrypt
 * @returns Promise with encrypted file and metadata
 */
export const encryptFile = async (file: File): Promise<EncryptionResult> => {
  try {
    // Convert file to array buffer
    const fileBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(fileBuffer);
    const fileString = arrayBufferToString(fileData);
    
    // Generate random encryption key and IV
    const keyBytes = CryptoJS.lib.WordArray.random(32); // 256 bits for AES-256
    const ivBytes = CryptoJS.lib.WordArray.random(16); // 128 bits for IV
    
    // Convert to string for storage
    const key = CryptoJS.enc.Base64.stringify(keyBytes);
    const iv = CryptoJS.enc.Base64.stringify(ivBytes);
    
    // Encrypt the file
    const encrypted = CryptoJS.AES.encrypt(fileString, keyBytes, { 
      iv: ivBytes, 
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    const encryptedString = encrypted.toString();
    const encryptedData = stringToUint8Array(encryptedString);
    
    // Create a new file with encrypted data
    const encryptedFile = new File([encryptedData], `${file.name}.enc`, {
      type: 'application/octet-stream'
    });
    
    // Calculate checksum of original file
    const checksum = await calculateChecksum(file);
    
    // Combine key and IV with a separator for easier storage
    const combinedKey = `${key}.${iv}`;
    
    return {
      encryptedFile,
      algorithm: 'AES-256-CBC',
      encryptionKey: combinedKey,
      iv,
      checksum
    };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt file');
  }
};

/**
 * Decrypts an encrypted file
 * @param encryptedFile Encrypted file
 * @param keyString Base64 encryption key
 * @param ivString Base64 IV
 * @returns Promise with decrypted file
 */
export const decryptFile = async (
  encryptedFile: File, 
  keyString: string, 
  ivString: string
): Promise<File> => {
  try {
    // Convert file to array buffer
    const fileBuffer = await encryptedFile.arrayBuffer();
    const encryptedData = new Uint8Array(fileBuffer);
    const encryptedString = arrayBufferToString(encryptedData);
    
    // Parse key and IV
    const keyBytes = CryptoJS.enc.Base64.parse(keyString);
    const ivBytes = CryptoJS.enc.Base64.parse(ivString);
    
    // Decrypt the data
    const decrypted = CryptoJS.AES.decrypt(encryptedString, keyBytes, {
      iv: ivBytes,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    const decryptedData = stringToUint8Array(decryptedString);
    
    // Create original filename (remove .enc extension if present)
    const originalName = encryptedFile.name.endsWith('.enc') 
      ? encryptedFile.name.slice(0, -4) 
      : encryptedFile.name;
    
    // Attempt to determine the original file type
    let fileType = 'application/octet-stream';
    
    // A simple check for common file extensions
    if (originalName.endsWith('.jpg') || originalName.endsWith('.jpeg')) {
      fileType = 'image/jpeg';
    } else if (originalName.endsWith('.png')) {
      fileType = 'image/png';
    } else if (originalName.endsWith('.pdf')) {
      fileType = 'application/pdf';
    } else if (originalName.endsWith('.txt')) {
      fileType = 'text/plain';
    } else if (originalName.endsWith('.docx')) {
      fileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    
    // Create a new file with decrypted data
    return new File([decryptedData], originalName, {
      type: fileType
    });
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt file. Invalid key or corrupted file.');
  }
};

/**
 * Calculate SHA-256 checksum of a file
 * @param file File to calculate checksum for
 * @returns Promise with checksum string
 */
export const calculateChecksum = async (file: File): Promise<string> => {
  try {
    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);
    const wordArray = arrayBufferToWordArray(data);
    const hash = CryptoJS.SHA256(wordArray);
    return hash.toString(CryptoJS.enc.Hex);
  } catch (error) {
    console.error('Checksum calculation failed:', error);
    throw new Error('Failed to calculate file checksum');
  }
};

/**
 * Generate a file preview
 * @param file File to preview
 * @returns Promise with preview URL or content
 */
export const generateFilePreview = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // For images, create an object URL
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      resolve(url);
      return;
    }
    
    // For PDFs, also create an object URL
    if (file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      resolve(url);
      return;
    }
    
    // For text files, read the content
    if (file.type === 'text/plain' || 
        file.type === 'text/html' || 
        file.type === 'text/css' || 
        file.type === 'application/json' ||
        file.type === 'text/javascript') {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = (e) => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsText(file);
      return;
    }
    
    // For other file types, just return the file name and type
    resolve(`No preview available for ${file.name} (${file.type})`);
  });
};

/**
 * Download a file
 * @param file File to download
 */
export const downloadFile = (file: File): void => {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Helper function to convert ArrayBuffer to WordArray (for CryptoJS)
function arrayBufferToWordArray(ab: ArrayBuffer | Uint8Array): CryptoJS.lib.WordArray {
  const i8a = new Uint8Array(ab);
  const a = [];
  for (let i = 0; i < i8a.length; i += 4) {
    a.push(
      (i8a[i] << 24) |
      (i8a[i + 1] << 16) |
      (i8a[i + 2] << 8) |
      i8a[i + 3]
    );
  }
  return CryptoJS.lib.WordArray.create(a, i8a.length);
}

// Helper function to convert ArrayBuffer to string
function arrayBufferToString(buffer: ArrayBuffer | Uint8Array): string {
  const uint8Array = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let str = '';
  for (let i = 0; i < uint8Array.length; i++) {
    str += String.fromCharCode(uint8Array[i]);
  }
  return str;
}

// Helper function to convert string to Uint8Array
function stringToUint8Array(str: string): Uint8Array {
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i);
  }
  return arr;
}

// Helper function to convert base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const uint8Array = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < uint8Array.byteLength; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

// Export types and helper functions
export type { EncryptionResult, DecryptionResult };
export { 
  arrayBufferToBase64,
  base64ToArrayBuffer,
  arrayBufferToWordArray
};
