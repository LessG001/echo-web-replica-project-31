
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

// Generate a new MFA secret (would use a proper TOTP library in production)
export const generateMFASecret = (): string => {
  // In a real app, we would use a proper TOTP library
  // For demo purposes, we'll generate a random string
  return uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase();
};

// Generate a QR code for the MFA setup
export const generateMFAQRCode = async (
  secret: string, 
  email: string, 
  appName: string = 'SecureVault'
): Promise<string> => {
  try {
    const otpAuthUrl = `otpauth://totp/${appName}:${email}?secret=${secret}&issuer=${appName}`;
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
  return /^\d{6}$/.test(code);
};
