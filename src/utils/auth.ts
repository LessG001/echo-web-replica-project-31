
// This file contains authentication-related utility functions
import { v4 as uuidv4 } from 'uuid';
import { logInfo, LogCategory } from '@/utils/audit-logger';

export interface User {
  id: string;
  email: string;
  password?: string;
  createdAt: string;
  lastLogin?: string;
  mfaEnabled?: boolean;
  mfaSecret?: string;
}

interface Session {
  userId: string;
  expiresAt: string; // ISO string date
}

interface AuthResult {
  success: boolean;
  message: string;
  userId?: string;
  requireMFA?: boolean;
}

// Constants
const SESSION_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds
const SESSION_KEY = 'secure_vault_session';
const USERS_KEY = 'secure_vault_users';

// Initialize the default user for demo purposes
export const initializeDefaultUser = (): void => {
  // Check if users already exist in localStorage
  const usersData = localStorage.getItem(USERS_KEY);
  
  if (!usersData) {
    // Create a default user
    const defaultUser: User = {
      id: uuidv4(),
      email: 'demo@example.com',
      password: 'Password123!', // In a real app, this would be hashed
      createdAt: new Date().toISOString(),
      mfaEnabled: false
    };
    
    // Save the default user to localStorage
    localStorage.setItem(USERS_KEY, JSON.stringify([defaultUser]));
    
    logInfo(LogCategory.AUTH, 'Default user created');
  }
};

// Register a new user
export const register = (email: string, password: string): AuthResult => {
  try {
    // Get existing users from localStorage
    const usersData = localStorage.getItem(USERS_KEY);
    const users: User[] = usersData ? JSON.parse(usersData) : [];
    
    // Check if a user with this email already exists
    if (users.find(user => user.email === email)) {
      return { success: false, message: 'A user with this email already exists' };
    }
    
    // Create a new user
    const newUser: User = {
      id: uuidv4(),
      email,
      password, // In a real app, this would be hashed
      createdAt: new Date().toISOString(),
      mfaEnabled: false
    };
    
    // Add the new user to the users array
    users.push(newUser);
    
    // Save the updated users array to localStorage
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    logInfo(LogCategory.AUTH, `User registered: ${email}`);
    
    return { success: true, message: 'Registration successful', userId: newUser.id };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'An error occurred during registration' };
  }
};

// Login a user
export const login = (email: string, password: string): AuthResult => {
  try {
    // Get users from localStorage
    const usersData = localStorage.getItem(USERS_KEY);
    if (!usersData) {
      return { success: false, message: 'No users found. Please register first.' };
    }
    
    const users: User[] = JSON.parse(usersData);
    
    // Find the user with the given email
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }
    
    // Check if the password matches
    if (user.password !== password) {
      return { success: false, message: 'Invalid email or password' };
    }
    
    // If MFA is enabled, return requireMFA flag
    if (user.mfaEnabled) {
      return { 
        success: true, 
        message: 'MFA verification required', 
        userId: user.id,
        requireMFA: true
      };
    }
    
    // Create a new session
    createSession(user.id);
    
    // Update last login time
    updateUserLastLogin(user.id);
    
    logInfo(LogCategory.AUTH, `User logged in: ${email}`);
    
    return { success: true, message: 'Login successful', userId: user.id };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'An error occurred during login' };
  }
};

// Complete MFA login
export const completeMFALogin = (userId: string, code: string): AuthResult => {
  try {
    // Get users from localStorage
    const usersData = localStorage.getItem(USERS_KEY);
    if (!usersData) {
      return { success: false, message: 'User database not found' };
    }
    
    const users: User[] = JSON.parse(usersData);
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    // In a real app, we would verify the TOTP code using the user's mfaSecret
    // For this demo, we'll accept any 6-digit code
    if (code.length === 6 && /^\d+$/.test(code)) {
      createSession(userId);
      updateUserLastLogin(userId);
      
      logInfo(LogCategory.AUTH, `User completed MFA: ${user.email}`);
      
      return { success: true, message: 'MFA verification successful' };
    }
    
    return { success: false, message: 'Invalid verification code' };
  } catch (error) {
    console.error('MFA verification error:', error);
    return { success: false, message: 'An error occurred during MFA verification' };
  }
};

// Set up MFA for a user
export const setupMFA = (email: string, secret: string): AuthResult => {
  try {
    // Get users from localStorage
    const usersData = localStorage.getItem(USERS_KEY);
    if (!usersData) {
      return { success: false, message: 'User database not found' };
    }
    
    const users: User[] = JSON.parse(usersData);
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
      return { success: false, message: 'User not found' };
    }
    
    // Enable MFA for the user
    users[userIndex].mfaEnabled = true;
    users[userIndex].mfaSecret = secret;
    
    // Save the updated users array to localStorage
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    logInfo(LogCategory.AUTH, `MFA set up for user: ${email}`);
    
    return { success: true, message: 'MFA setup successful' };
  } catch (error) {
    console.error('MFA setup error:', error);
    return { success: false, message: 'An error occurred during MFA setup' };
  }
};

// Create a new session
const createSession = (userId: string): void => {
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY).toISOString();
  const session: Session = { userId, expiresAt };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

// Check if a user is authenticated
export const isAuthenticated = (): boolean => {
  const sessionData = localStorage.getItem(SESSION_KEY);
  if (!sessionData) return false;
  
  try {
    const session: Session = JSON.parse(sessionData);
    const expiresAt = new Date(session.expiresAt);
    return expiresAt > new Date();
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
};

// Get the current authenticated user
export const getCurrentUser = (): User | null => {
  const sessionData = localStorage.getItem(SESSION_KEY);
  if (!sessionData) return null;
  
  try {
    const session: Session = JSON.parse(sessionData);
    if (!session.userId || new Date(session.expiresAt) < new Date()) {
      return null;
    }
    
    // Get user data
    const usersData = localStorage.getItem(USERS_KEY);
    if (!usersData) return null;
    
    const users: User[] = JSON.parse(usersData);
    const user = users.find(u => u.id === session.userId);
    
    if (!user) return null;
    
    // Ensure all required fields exist
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Default 30 days ago
      lastLogin: user.lastLogin || new Date().toISOString(),
      mfaEnabled: user.mfaEnabled || false,
      mfaSecret: user.mfaSecret
    };
  } catch (error) {
    console.error('Error parsing session:', error);
    return null;
  }
};

// Update the last activity timestamp
export const updateLastActivity = (): void => {
  const sessionData = localStorage.getItem(SESSION_KEY);
  if (!sessionData) return;
  
  try {
    const session: Session = JSON.parse(sessionData);
    session.expiresAt = new Date(Date.now() + SESSION_EXPIRY).toISOString();
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Error updating last activity:', error);
  }
};

// Update the user's last login timestamp
const updateUserLastLogin = (userId: string): void => {
  const usersData = localStorage.getItem(USERS_KEY);
  if (!usersData) return;
  
  try {
    const users: User[] = JSON.parse(usersData);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      users[userIndex].lastLogin = new Date().toISOString();
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  } catch (error) {
    console.error('Error updating last login:', error);
  }
};

// Logout the current user
export const logout = (): void => {
  localStorage.removeItem(SESSION_KEY);
  logInfo(LogCategory.AUTH, 'User logged out');
};

// Change user password
export const changePassword = (
  userId: string, 
  currentPassword: string, 
  newPassword: string
): { success: boolean; message: string } => {
  // Get users from localStorage
  const usersData = localStorage.getItem(USERS_KEY);
  if (!usersData) {
    return { success: false, message: "User database not found" };
  }

  const users: User[] = JSON.parse(usersData);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return { success: false, message: "User not found" };
  }
  
  // Verify the current password
  if (users[userIndex].password !== currentPassword) {
    return { success: false, message: "Current password is incorrect" };
  }
  
  // Update the password
  users[userIndex].password = newPassword;
  
  // Save back to localStorage
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  logInfo(LogCategory.AUTH, `Password changed for user: ${users[userIndex].email}`);
  
  return { success: true, message: "Password updated successfully" };
};
