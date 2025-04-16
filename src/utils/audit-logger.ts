
import { getCurrentUserEmail } from './auth';
import * as fs from 'fs';

export enum LogLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SECURITY = 'SECURITY'
}

export enum LogCategory {
  AUTH = 'Authentication',
  FILE = 'File Operation',
  SECURITY = 'Security',
  SYSTEM = 'System'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  user?: string;
  details?: any;
}

// Define paths for data storage
const DATA_DIR = './data';
const LOGS_FILE_PATH = `${DATA_DIR}/auditLogs.json`;

// In-memory log storage
let auditLogs: LogEntry[] = [];

// Ensure data directory exists
const ensureDataDirectoryExists = (): void => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (error) {
    console.error("Failed to create data directory:", error);
  }
};

// Load logs from storage
const loadLogs = (): void => {
  try {
    ensureDataDirectoryExists();
    
    // Try filesystem first
    if (fs.existsSync(LOGS_FILE_PATH)) {
      const data = fs.readFileSync(LOGS_FILE_PATH, 'utf8');
      auditLogs = JSON.parse(data);
      return;
    }
  } catch (error) {
    console.error("Failed to load audit logs from filesystem:", error);
  }
  
  // Fallback to localStorage
  try {
    const storedLogs = localStorage.getItem('auditLogs');
    if (storedLogs) {
      auditLogs = JSON.parse(storedLogs);
    }
  } catch (error) {
    console.error("Failed to load audit logs from localStorage:", error);
  }
};

// Save logs to storage
const saveLogs = (): void => {
  try {
    ensureDataDirectoryExists();
    
    // Try filesystem first
    fs.writeFileSync(LOGS_FILE_PATH, JSON.stringify(auditLogs, null, 2));
  } catch (error) {
    console.error("Failed to save audit logs to filesystem:", error);
    
    // Fallback to localStorage
    try {
      localStorage.setItem('auditLogs', JSON.stringify(auditLogs));
    } catch (storageError) {
      console.error("Failed to save to localStorage:", storageError);
    }
  }
};

// Initialize by loading logs
loadLogs();

// Add a log entry
export const log = (
  level: LogLevel,
  category: LogCategory,
  message: string,
  details?: any
): void => {
  const timestamp = new Date().toISOString();
  const user = getCurrentUserEmail();
  
  const logEntry: LogEntry = {
    timestamp,
    level,
    category,
    message,
    user: user || 'Anonymous',
    details
  };
  
  auditLogs.unshift(logEntry); // Add to beginning for reverse chronological order
  
  // Keep only the last 1000 logs
  if (auditLogs.length > 1000) {
    auditLogs = auditLogs.slice(0, 1000);
  }
  
  saveLogs();
  console.log(`[${level}] [${category}] ${message}`);
};

// Helper methods for common log types
export const logInfo = (category: LogCategory, message: string, details?: any): void => {
  log(LogLevel.INFO, category, message, details);
};

export const logWarning = (category: LogCategory, message: string, details?: any): void => {
  log(LogLevel.WARNING, category, message, details);
};

export const logError = (category: LogCategory, message: string, details?: any): void => {
  log(LogLevel.ERROR, category, message, details);
};

export const logSecurity = (category: LogCategory, message: string, details?: any): void => {
  log(LogLevel.SECURITY, category, message, details);
};

// Get logs with filtering
export const getLogs = (
  level?: LogLevel,
  category?: LogCategory,
  user?: string,
  startDate?: Date,
  endDate?: Date,
  limit: number = 100
): LogEntry[] => {
  // Ensure we have the latest logs
  loadLogs();
  
  let filteredLogs = auditLogs;
  
  if (level) {
    filteredLogs = filteredLogs.filter(log => log.level === level);
  }
  
  if (category) {
    filteredLogs = filteredLogs.filter(log => log.category === category);
  }
  
  if (user) {
    filteredLogs = filteredLogs.filter(log => log.user?.includes(user));
  }
  
  if (startDate) {
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= startDate);
  }
  
  if (endDate) {
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= endDate);
  }
  
  return filteredLogs.slice(0, limit);
};

// Clear all logs
export const clearLogs = (): void => {
  auditLogs = [];
  saveLogs();
};

// Export types
export type { LogEntry };
