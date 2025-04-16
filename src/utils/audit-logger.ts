
// Enum for log levels
export enum LogLevel {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
  SECURITY = "SECURITY"
}

// Enum for log categories
export enum LogCategory {
  AUTH = "Authentication",
  FILE = "File Operation",
  SECURITY = "Security",
  SYSTEM = "System"
}

// Interface for log entries
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  user?: string;
  details?: Record<string, any>;
}

// Local storage key for logs
const LOGS_KEY = "secure_vault_logs";

// Get current user from session
const getCurrentUser = (): string | undefined => {
  try {
    const sessionData = localStorage.getItem("secure_vault_session");
    if (sessionData) {
      const session = JSON.parse(sessionData);
      return session.email;
    }
  } catch (error) {
    console.error("Error getting current user:", error);
  }
  return undefined;
};

// Add a log entry
const addLog = (
  level: LogLevel,
  category: LogCategory,
  message: string,
  details?: Record<string, any>
): void => {
  try {
    const logs = getLogs();
    const user = getCurrentUser();
    
    const newLog: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      user,
      details
    };
    
    logs.unshift(newLog); // Add to the beginning for chronological display
    
    // Limit logs to 1000 entries
    if (logs.length > 1000) {
      logs.pop();
    }
    
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error("Error adding log:", error);
  }
};

// Get all logs
export const getLogs = (): LogEntry[] => {
  try {
    const logsData = localStorage.getItem(LOGS_KEY);
    return logsData ? JSON.parse(logsData) : [];
  } catch (error) {
    console.error("Error getting logs:", error);
    return [];
  }
};

// Helper functions for each log level
export const logInfo = (
  category: LogCategory,
  message: string,
  details?: Record<string, any>
): void => {
  addLog(LogLevel.INFO, category, message, details);
};

export const logWarning = (
  category: LogCategory,
  message: string,
  details?: Record<string, any>
): void => {
  addLog(LogLevel.WARNING, category, message, details);
};

export const logError = (
  category: LogCategory,
  message: string,
  details?: Record<string, any>
): void => {
  addLog(LogLevel.ERROR, category, message, details);
};

export const logSecurity = (
  category: LogCategory,
  message: string,
  details?: Record<string, any>
): void => {
  addLog(LogLevel.SECURITY, category, message, details);
};
