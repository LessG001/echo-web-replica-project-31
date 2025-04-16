
// This file contains MFA-related utility functions
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';

// Generate a random MFA secret key
export const generateMFASecret = (): string => {
  // Generate a base32 encoded secret (used by TOTP)
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  const randomBytes = new Uint8Array(20);
  window.crypto.getRandomValues(randomBytes);
  
  // Convert to base32 encoding (used by Google Authenticator)
  for (let i = 0; i < 16; i++) {
    secret += characters[randomBytes[i] % characters.length];
  }
  
  return secret;
};

// Generate a QR code data URL for MFA setup
export const generateMFAQRCode = async (secret: string, email: string): Promise<string> => {
  // Create proper otpauth URL format required by Google Authenticator
  const issuer = encodeURIComponent('SecureVault');
  const account = encodeURIComponent(email);
  const secretParam = encodeURIComponent(secret);
  const otpauthUrl = `otpauth://totp/${issuer}:${account}?secret=${secretParam}&issuer=${issuer}`;
  
  try {
    // Generate actual QR code
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    return '';
  }
};

// Verify a TOTP code
export const verifyTOTP = (secret: string, code: string): boolean => {
  // For demo purposes only - this would validate against current time window in a real app
  // In a real app, we would:
  // 1. Convert the secret to a buffer
  // 2. Calculate the HMAC-SHA1 of the current time period
  // 3. Extract a 6-digit code from the HMAC
  // 4. Compare it to the user's input
  
  return code.length === 6 && /^\d+$/.test(code);
};
