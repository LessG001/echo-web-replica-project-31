
// This is a simplified MFA implementation for demo purposes
// In a real application, you would use a library like otplib or speakeasy

export const generateMFASecret = (): string => {
  // In a real application, this would be a secure random string
  // For demo purposes, return a fixed string
  return "JBSWY3DPEHPK3PXP";
};

export const generateMFAQRCode = (secret: string, email: string): string => {
  // In a real application, this would generate a QR code data URL
  // For demo purposes, return a placeholder
  const issuer = encodeURIComponent("SecureVault");
  const account = encodeURIComponent(email);
  const secretEncoded = encodeURIComponent(secret);
  
  // This is the URL format for authenticator apps
  const otpauth = `otpauth://totp/${issuer}:${account}?secret=${secretEncoded}&issuer=${issuer}`;
  
  // In a real app, you would convert this to a QR code image
  // For demo, we'll just return the URL
  return otpauth;
};

export const verifyTOTP = (secret: string, code: string): boolean => {
  // In a real application, this would verify the code against the secret
  // For demo purposes, accept any 6-digit code
  return code.length === 6 && /^\d+$/.test(code);
};
