// This file contains encryption-related utility functions

import CryptoJS from 'crypto-js';

// Encrypt a file using AES-256
export const encryptFile = async (file: File): Promise<{
  encryptedFile: File;
  encryptionKey: string;
  algorithm: string;
  iv: string;
  checksum: string;
}> => {
  // Generate a random encryption key and initialization vector (IV)
  const keyBytes = CryptoJS.lib.WordArray.random(32); // 256 bits
  const ivBytes = CryptoJS.lib.WordArray.random(16); // 128 bits
  
  // Convert the key and IV to base64 for storage and transmission
  const key = CryptoJS.enc.Base64.stringify(keyBytes);
  const iv = CryptoJS.enc.Base64.stringify(ivBytes);
  
  // Combine key and IV with a delimiter for user-friendly handling
  const combinedKey = `${key}.${iv}`;
  
  try {
    // Read the file as an ArrayBuffer
    const arrayBuffer = await readFileAsArrayBuffer(file);
    
    // Convert ArrayBuffer to WordArray for CryptoJS
    const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
    
    // Calculate checksum of the original file
    const checksum = CryptoJS.SHA256(wordArray).toString();
    
    // Encrypt the file content
    const encrypted = CryptoJS.AES.encrypt(wordArray, keyBytes, { 
      iv: ivBytes,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    // Convert the encrypted data to binary
    const encryptedBase64 = encrypted.toString();
    const encryptedBinary = atob(encryptedBase64);
    const encryptedArrayBuffer = new ArrayBuffer(encryptedBinary.length);
    const encryptedUint8Array = new Uint8Array(encryptedArrayBuffer);
    
    for (let i = 0; i < encryptedBinary.length; i++) {
      encryptedUint8Array[i] = encryptedBinary.charCodeAt(i);
    }
    
    // Create a new encrypted File object
    const encryptedFileName = `${file.name}.encrypted`;
    const encryptedFile = new File(
      [encryptedArrayBuffer], 
      encryptedFileName,
      { type: 'application/octet-stream' }
    );
    
    return {
      encryptedFile,
      encryptionKey: combinedKey,
      algorithm: 'AES-256-CBC',
      iv,
      checksum
    };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt file');
  }
};

// Decrypt a file using AES-256
export const decryptFile = async (
  encryptedFile: File, 
  key: string, 
  iv: string
): Promise<File> => {
  try {
    // Read the encrypted file as an ArrayBuffer
    const arrayBuffer = await readFileAsArrayBuffer(encryptedFile);
    
    // Convert the ArrayBuffer to a WordArray for CryptoJS
    const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
    
    // Convert the WordArray to a Base64 string
    const encryptedBase64 = CryptoJS.enc.Base64.stringify(wordArray);
    
    // Convert the key and IV from base64 to WordArray
    const keyBytes = CryptoJS.enc.Base64.parse(key);
    const ivBytes = CryptoJS.enc.Base64.parse(iv);
    
    // Decrypt the file content
    const decrypted = CryptoJS.AES.decrypt(encryptedBase64, keyBytes, { 
      iv: ivBytes,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    // Convert the decrypted WordArray to an ArrayBuffer
    const decryptedArrayBuffer = wordArrayToArrayBuffer(decrypted);
    
    // Determine the original file name (remove .encrypted extension if present)
    let originalFileName = encryptedFile.name;
    if (originalFileName.endsWith('.encrypted')) {
      originalFileName = originalFileName.slice(0, -10); // Remove .encrypted
    }
    
    // Create a new File object with the decrypted content
    // We don't know the original MIME type, so we'll infer it from the file extension
    const extension = originalFileName.split('.').pop()?.toLowerCase() || '';
    const mimeType = getMimeTypeFromExtension(extension) || 'application/octet-stream';
    
    return new File([decryptedArrayBuffer], originalFileName, { type: mimeType });
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt file. Invalid key or corrupted file.');
  }
};

// Calculate checksum (SHA-256) of a file
export const calculateChecksum = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
    return CryptoJS.SHA256(wordArray).toString();
  } catch (error) {
    console.error('Checksum calculation failed:', error);
    throw new Error('Failed to calculate file checksum');
  }
};

// Download a file
export const downloadFile = (file: File): void => {
  // Create a blob URL for the file
  const url = URL.createObjectURL(file);
  
  // Create a temporary anchor element for downloading
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  
  // Append the anchor to the document, click it, and remove it
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  // Revoke the blob URL to free up memory
  URL.revokeObjectURL(url);
};

// Generate a preview for a file
export const generateFilePreview = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // For text files, read and return content
    if (
      file.type.startsWith('text/') || 
      file.type === 'application/json' ||
      file.type === 'application/javascript'
    ) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
      return;
    }
    
    // For images, PDFs and other browser-renderable files, return object URL
    if (
      file.type.startsWith('image/') || 
      file.type === 'application/pdf'
    ) {
      const objectUrl = URL.createObjectURL(file);
      resolve(objectUrl);
      return;
    }
    
    // For other file types, just create a data URL
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// Helper function to read a file as an ArrayBuffer
const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

// Helper function to convert a WordArray to an ArrayBuffer
const wordArrayToArrayBuffer = (wordArray: CryptoJS.lib.WordArray): ArrayBuffer => {
  const words = wordArray.words;
  const sigBytes = wordArray.sigBytes;
  const buffer = new ArrayBuffer(sigBytes);
  const uint8View = new Uint8Array(buffer);
  
  for (let i = 0; i < sigBytes; i++) {
    uint8View[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }
  
  return buffer;
};

// Helper function to infer MIME type from file extension
const getMimeTypeFromExtension = (extension: string): string | null => {
  const mimeTypes: Record<string, string> = {
    'txt': 'text/plain',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'text/javascript',
    'json': 'application/json',
    'pdf': 'application/pdf',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'mp3': 'audio/mpeg',
    'mp4': 'video/mp4',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    'tar': 'application/x-tar',
    'gz': 'application/gzip'
  };
  
  return extension in mimeTypes ? mimeTypes[extension] : null;
};
