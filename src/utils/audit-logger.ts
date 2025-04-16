
// This file contains audit logging functionality
import { getCurrentUser } from './auth';

export enum LogCategory {
  AUTH = 'AUTH',
  FILE = 'FILE',
  SECURITY = 'SECURITY',
  USER = 'USER',
  SYSTEM = 'SYSTEM'
}

export enum LogLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  category: LogCategory;
  level: LogLevel;
  message: string;
  userId?: string;
  userEmail?: string;
  metadata?: object;
}

// Create an info log entry
export const logInfo = (
  category: LogCategory,
  message: string,
  metadata?: object
): void => {
  createLogEntry(LogLevel.INFO, category, message, metadata);
};

// Create a warning log entry
export const logWarning = (
  category: LogCategory,
  message: string,
  metadata?: object
): void => {
  createLogEntry(LogLevel.WARNING, category, message, metadata);
};

// Create an error log entry
export const logError = (
  category: LogCategory,
  message: string,
  metadata?: object
): void => {
  createLogEntry(LogLevel.ERROR, category, message, metadata);
};

// For security-specific events, use this function
export const logSecurity = (
  level: LogLevel,
  message: string,
  metadata?: object
): void => {
  createLogEntry(level, LogCategory.SECURITY, message, metadata);
};

// Create a log entry and store it in localStorage
const createLogEntry = (
  level: LogLevel,
  category: LogCategory,
  message: string,
  metadata?: object
): void => {
  try {
    const currentUser = getCurrentUser();
    
    const logEntry: LogEntry = {
      id: generateLogId(),
      timestamp: new Date().toISOString(),
      category,
      level,
      message,
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      metadata
    };
    
    // Get existing logs from localStorage
    const logsData = localStorage.getItem('secure_vault_logs');
    const logs: LogEntry[] = logsData ? JSON.parse(logsData) : [];
    
    // Add the new log entry
    logs.unshift(logEntry); // Add to beginning of array
    
    // Limit the number of stored logs to prevent localStorage overflow
    const maxLogs = 1000;
    const trimmedLogs = logs.slice(0, maxLogs);
    
    // Save back to localStorage
    localStorage.setItem('secure_vault_logs', JSON.stringify(trimmedLogs));
    
    // Log to console for debugging
    console.log(`[${level}][${category}] ${message}`, metadata);
  } catch (error) {
    console.error('Failed to create log entry:', error);
  }
};

// Generate a unique log ID
const generateLogId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

// Get all log entries
export const getLogs = (): LogEntry[] => {
  const logsData = localStorage.getItem('secure_vault_logs');
  return logsData ? JSON.parse(logsData) : [];
};

// Filter logs by category, level, or time range
export const filterLogs = (
  options: {
    category?: LogCategory;
    level?: LogLevel;
    startDate?: string;
    endDate?: string;
    userId?: string;
  }
): LogEntry[] => {
  const logs = getLogs();
  
  return logs.filter(log => {
    if (options.category && log.category !== options.category) {
      return false;
    }
    
    if (options.level && log.level !== options.level) {
      return false;
    }
    
    if (options.userId && log.userId !== options.userId) {
      return false;
    }
    
    if (options.startDate) {
      const startDate = new Date(options.startDate);
      const logDate = new Date(log.timestamp);
      if (logDate < startDate) {
        return false;
      }
    }
    
    if (options.endDate) {
      const endDate = new Date(options.endDate);
      const logDate = new Date(log.timestamp);
      if (logDate > endDate) {
        return false;
      }
    }
    
    return true;
  });
};

// Clear all logs
export const clearLogs = (): void => {
  localStorage.removeItem('secure_vault_logs');
};
