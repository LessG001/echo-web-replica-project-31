import { getCurrentUserEmail } from './auth';

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

// In-memory log storage
let auditLogs: LogEntry[] = [];

// Load logs from localStorage
const loadLogs = (): void => {
  const storedLogs = localStorage.getItem('auditLogs');
  if (storedLogs) {
    auditLogs = JSON.parse(storedLogs);
  }
};

// Save logs to localStorage
const saveLogs = (): void => {
  localStorage.setItem('auditLogs', JSON.stringify(auditLogs));
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
