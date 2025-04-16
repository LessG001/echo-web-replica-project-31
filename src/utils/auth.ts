
import { logSecurity, LogCategory } from "@/utils/audit-logger";
import { verifyTOTP, generateMFASecret } from "@/utils/mfa";

// Define user interface without export to avoid conflict
interface UserData {
  id: string;
  email: string;
  password: string;
  mfaEnabled: boolean;
  mfaSecret?: string;
  lastActivity: number;
  createdAt: number; // Add timestamp for account creation
  lastLogin?: number; // Add timestamp for last login
}

// Export with different name to avoid conflict
export type UserProfile = UserData;

// Session duration in milliseconds (30 minutes)
const SESSION_DURATION = 30 * 60 * 1000;
const SESSION_KEY = "secure_vault_session";
const USERS_KEY = "secure_vault_users";
const DEFAULT_USER = {
  id: "user-1",
  email: "demo@example.com",
  password: "Password123!",
  mfaEnabled: true,
  mfaSecret: "JBSWY3DPEHPK3PXP", // Demo MFA secret
  lastActivity: Date.now(),
  createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
  lastLogin: Date.now() - 2 * 24 * 60 * 60 * 1000 // 2 days ago
};

// Initialize users in localStorage if they don't exist
export const initializeDefaultUser = (): void => {
  const users = getUsers();
  if (users.length === 0) {
    const usersData = [DEFAULT_USER];
    localStorage.setItem(USERS_KEY, JSON.stringify(usersData));
    console.log("Default user initialized");
  }
};

// Get all users from localStorage
const getUsers = (): UserData[] => {
  const usersData = localStorage.getItem(USERS_KEY);
  return usersData ? JSON.parse(usersData) : [];
};

// Update users in localStorage
const updateUsers = (users: UserData[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Register a new user
export const register = (email: string, password: string): { success: boolean; message: string } => {
  const users = getUsers();
  
  // Check if user already exists
  if (users.some(user => user.email === email)) {
    return { success: false, message: "User already exists" };
  }
  
  // Create new user
  const newUser: UserData = {
    id: `user-${Date.now()}`,
    email,
    password,
    mfaEnabled: false,
    lastActivity: Date.now(),
    createdAt: Date.now()
  };
  
  users.push(newUser);
  updateUsers(users);
  
  // Log security event
  logSecurity(LogCategory.AUTH, `User registered: ${email}`);
  
  return { success: true, message: "Registration successful" };
};

// Login user
export const login = (email: string, password: string): { success: boolean; message: string; requireMFA: boolean; userId?: string } => {
  const users = getUsers();
  const user = users.find(user => user.email === email);
  
  if (!user) {
    logSecurity(LogCategory.AUTH, `Failed login attempt for non-existent user: ${email}`);
    return { success: false, message: "Invalid email or password", requireMFA: false };
  }
  
  if (user.password !== password) {
    logSecurity(LogCategory.AUTH, `Failed login attempt for user: ${email} (invalid password)`);
    return { success: false, message: "Invalid email or password", requireMFA: false };
  }
  
  // If MFA is enabled, require MFA verification
  if (user.mfaEnabled) {
    logSecurity(LogCategory.AUTH, `MFA required for user: ${email}`);
    return { success: true, message: "MFA verification required", requireMFA: true, userId: user.id };
  }
  
  // Update last login time
  const userIndex = users.findIndex(u => u.id === user.id);
  if (userIndex !== -1) {
    users[userIndex].lastLogin = Date.now();
    updateUsers(users);
  }
  
  // Create session
  createSession(user);
  
  logSecurity(LogCategory.AUTH, `User logged in: ${email}`);
  return { success: true, message: "Login successful", requireMFA: false };
};

// Complete MFA login
export const completeMFALogin = (userId: string, code: string): { success: boolean; message: string } => {
  const users = getUsers();
  const user = users.find(user => user.id === userId);
  
  if (!user) {
    logSecurity(LogCategory.AUTH, `MFA verification failed: User not found`);
    return { success: false, message: "User not found" };
  }
  
  // Verify MFA code
  if (!user.mfaSecret) {
    logSecurity(LogCategory.AUTH, `MFA verification failed: No MFA secret for user ${user.email}`);
    return { success: false, message: "MFA not set up for this user" };
  }
  
  const isValid = verifyTOTP(user.mfaSecret, code);
  
  if (!isValid) {
    logSecurity(LogCategory.AUTH, `MFA verification failed: Invalid code for user ${user.email}`);
    return { success: false, message: "Invalid verification code" };
  }
  
  // Update last login time
  const userIndex = users.findIndex(u => u.id === user.id);
  if (userIndex !== -1) {
    users[userIndex].lastLogin = Date.now();
    updateUsers(users);
  }
  
  // Create session
  createSession(user);
  
  logSecurity(LogCategory.AUTH, `User completed MFA login: ${user.email}`);
  return { success: true, message: "Login successful" };
};

// Change password
export const changePassword = (userId: string, currentPassword: string, newPassword: string): { success: boolean; message: string } => {
  const users = getUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return { success: false, message: "User not found" };
  }
  
  const user = users[userIndex];
  
  // Verify current password
  if (user.password !== currentPassword) {
    logSecurity(LogCategory.AUTH, `Failed password change attempt: Incorrect current password for user ${user.email}`);
    return { success: false, message: "Current password is incorrect" };
  }
  
  // Update password
  users[userIndex].password = newPassword;
  updateUsers(users);
  
  logSecurity(LogCategory.AUTH, `Password changed for user: ${user.email}`);
  return { success: true, message: "Password changed successfully" };
};

// Set up MFA for a user
export const setupMFA = (email: string, mfaSecret: string): { success: boolean; message: string } => {
  const users = getUsers();
  const userIndex = users.findIndex(user => user.email === email);
  
  if (userIndex === -1) {
    return { success: false, message: "User not found" };
  }
  
  users[userIndex].mfaEnabled = true;
  users[userIndex].mfaSecret = mfaSecret;
  
  updateUsers(users);
  
  logSecurity(LogCategory.AUTH, `MFA set up for user: ${email}`);
  return { success: true, message: "MFA set up successfully" };
};

// Create a session
const createSession = (user: UserData): void => {
  const session = {
    userId: user.id,
    email: user.email,
    expiresAt: Date.now() + SESSION_DURATION,
    mfaEnabled: user.mfaEnabled,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin
  };
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  updateLastActivity();
};

// Check if a user is authenticated
export const isAuthenticated = (): boolean => {
  const sessionData = localStorage.getItem(SESSION_KEY);
  
  if (!sessionData) {
    return false;
  }
  
  const session = JSON.parse(sessionData);
  
  // Check if session has expired
  if (session.expiresAt < Date.now()) {
    localStorage.removeItem(SESSION_KEY);
    return false;
  }
  
  return true;
};

// Update last activity timestamp
export const updateLastActivity = (): void => {
  const sessionData = localStorage.getItem(SESSION_KEY);
  
  if (sessionData) {
    const session = JSON.parse(sessionData);
    session.expiresAt = Date.now() + SESSION_DURATION;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    
    // Also update the user's last activity
    const users = getUsers();
    const userIndex = users.findIndex(user => user.id === session.userId);
    
    if (userIndex !== -1) {
      users[userIndex].lastActivity = Date.now();
      updateUsers(users);
    }
  }
};

// Get current authenticated user
export const getCurrentUser = (): { id: string; email: string; mfaEnabled: boolean; createdAt: number; lastLogin?: number } | null => {
  if (!isAuthenticated()) {
    return null;
  }
  
  const sessionData = localStorage.getItem(SESSION_KEY);
  
  if (!sessionData) {
    return null;
  }
  
  const session = JSON.parse(sessionData);
  
  return {
    id: session.userId,
    email: session.email,
    mfaEnabled: session.mfaEnabled || false,
    createdAt: session.createdAt || Date.now() - (30 * 24 * 60 * 60 * 1000), // Default to 30 days ago
    lastLogin: session.lastLogin
  };
};

// Logout user
export const logout = (): void => {
  const currentUser = getCurrentUser();
  
  if (currentUser) {
    logSecurity(LogCategory.AUTH, `User logged out: ${currentUser.email}`);
  }
  
  localStorage.removeItem(SESSION_KEY);
};
