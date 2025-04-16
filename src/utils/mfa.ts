
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

// Base32 character set (RFC 4648)
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// Generate a new MFA secret in Base32 format for compatibility with Google Authenticator
export const generateMFASecret = (): string => {
  // Generate a random Base32 string of 16 characters (80 bits) which is standard for TOTP
  let secret = '';
  for (let i = 0; i < 16; i++) {
    const randomIndex = Math.floor(Math.random() * BASE32_CHARS.length);
    secret += BASE32_CHARS[randomIndex];
  }
  return secret;
};

// Generate a QR code for the MFA setup
export const generateMFAQRCode = async (
  secret: string, 
  email: string, 
  appName: string = 'SecureVault'
): Promise<string> => {
  try {
    // Format the otpauth URL exactly as expected by authenticator apps
    const otpAuthUrl = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(appName)}&algorithm=SHA1&digits=6&period=30`;
    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

// In a real app, we would verify the TOTP code here
// For demo purposes, we'll use a simple validation (any 6-digit number)
export const verifyTOTP = (code: string, secret: string): boolean => {
  // For a real implementation, we would use a TOTP library
  // This is just a placeholder that checks if the code is 6 digits
  return /^\d{6}$/.test(code);
};
