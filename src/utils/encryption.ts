
/**
 * Encryption and decryption utilities
 */

/**
 * Encrypts a file using AES algorithm
 * @param file File to encrypt
 * @returns Promise with encrypted file and metadata
 */
export const encryptFile = async (file: File): Promise<{ 
  encryptedFile: File, 
  algorithm: string, 
  encryptionKey: string, 
  iv: string 
}> => {
  // Convert file to array buffer
  const fileBuffer = await file.arrayBuffer();
  const fileData = new Uint8Array(fileBuffer);
  
  // Generate encryption key and IV
  const key = await generateEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt the file
  const encryptedData = await encryptData(fileData, key, iv);
  
  // Create a new file with encrypted data
  const encryptedFile = new File([encryptedData], `${file.name}.enc`, {
    type: 'application/octet-stream'
  });
  
  // Export key for storage
  const exportedKey = await exportKey(key);
  
  const keyBase64 = arrayBufferToBase64(exportedKey);
  const ivBase64 = arrayBufferToBase64(iv);
  
  // Combine the key and IV into a single string with a separator
  const combinedKey = `${keyBase64}.${ivBase64}`;
  
  return {
    encryptedFile,
    algorithm: 'AES-GCM',
    encryptionKey: combinedKey,
    iv: ivBase64
  };
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
  // Convert file to array buffer
  const fileBuffer = await encryptedFile.arrayBuffer();
  const encryptedData = new Uint8Array(fileBuffer);
  
  // Convert key and IV from base64
  const keyBuffer = base64ToArrayBuffer(keyString);
  const iv = base64ToArrayBuffer(ivString);
  
  // Import the key
  const key = await importKey(keyBuffer);
  
  // Decrypt the data
  const decryptedData = await decryptData(encryptedData, key, new Uint8Array(iv));
  
  // Create original filename (remove .enc extension if present)
  const originalName = encryptedFile.name.endsWith('.enc') 
    ? encryptedFile.name.slice(0, -4) 
    : encryptedFile.name;
  
  // Create a new file with decrypted data
  return new File([decryptedData], originalName, {
    type: 'application/octet-stream'
  });
};

// Helper functions
const generateEncryptionKey = async () => {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  );
};

const encryptData = async (data: Uint8Array, key: CryptoKey, iv: Uint8Array) => {
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    data
  );
  
  return new Uint8Array(encryptedBuffer);
};

const decryptData = async (data: Uint8Array, key: CryptoKey, iv: Uint8Array) => {
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    data
  );
  
  return new Uint8Array(decryptedBuffer);
};

const exportKey = async (key: CryptoKey) => {
  return await crypto.subtle.exportKey('raw', key);
};

const importKey = async (keyBuffer: ArrayBuffer) => {
  return await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['decrypt']
  );
};

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  const binaryString = bytes.reduce((str, byte) => str + String.fromCharCode(byte), '');
  return window.btoa(binaryString);
};

const base64ToArrayBuffer = (base64: string) => {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * Generate a file preview URL
 * @param file File to preview
 * @returns Promise with preview URL
 */
export const generateFilePreview = async (file: File): Promise<string> => {
  // Handle different file types
  if (file.type.startsWith('image/')) {
    return URL.createObjectURL(file);
  }
  
  if (file.type === 'application/pdf') {
    return URL.createObjectURL(file);
  }
  
  // For text files, read and return content
  if (file.type === 'text/plain' || 
      file.type === 'text/html' || 
      file.type === 'text/css' || 
      file.type === 'application/json' ||
      file.type === 'text/javascript') {
    const text = await file.text();
    const blob = new Blob([text], { type: file.type });
    return URL.createObjectURL(blob);
  }
  
  // Default: just return object URL
  return URL.createObjectURL(file);
};

/**
 * Calculate file checksum
 * @param file File to calculate checksum for
 * @returns Promise with checksum string
 */
export const calculateChecksum = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Download a file
 * @param file File to download
 * @param filename Optional name for the downloaded file
 */
export const downloadFile = (file: File, filename?: string) => {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
