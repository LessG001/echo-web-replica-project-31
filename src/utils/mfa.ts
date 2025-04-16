
// This file contains MFA-related utility functions
import { v4 as uuidv4 } from 'uuid';

// Generate a random MFA secret key
export const generateMFASecret = (): string => {
  // In a real app, this would use a proper TOTP library
  // For the demo, we'll just generate a random string
  const randomBytes = new Uint8Array(20);
  window.crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Generate a QR code URL for MFA setup
export const generateMFAQRCode = (secret: string, email: string): string => {
  // In a real app, this would generate a proper otpauth URL
  // and convert it to a QR code image
  // For the demo, we'll just return a placeholder
  const issuer = encodeURIComponent('SecureVault');
  const account = encodeURIComponent(email);
  const secretParam = encodeURIComponent(secret);
  
  return `otpauth://totp/${issuer}:${account}?secret=${secretParam}&issuer=${issuer}`;
};

// Verify a TOTP code
export const verifyTOTP = (secret: string, code: string): boolean => {
  // In a real app, this would use a proper TOTP library to verify the code
  // For the demo, we'll accept any 6-digit code
  return code.length === 6 && /^\d+$/.test(code);
};
