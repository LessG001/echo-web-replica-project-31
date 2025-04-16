
// This file contains MFA-related utility functions
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';
import * as OTPAuth from 'otpauth';

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
  if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
    return false;
  }

  try {
    // Create a new TOTP object with the secret
    const totp = new OTPAuth.TOTP({
      issuer: 'SecureVault',
      label: 'SecureVault',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret)
    });

    // Verify the TOTP code
    const delta = totp.validate({ token: code, window: 1 });
    
    // If delta is null, the token is invalid
    // If delta is a number (even negative), the token is valid
    return delta !== null;
  } catch (error) {
    console.error('TOTP verification error:', error);
    return false;
  }
};
