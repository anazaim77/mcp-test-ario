import { CONFIG } from "../config";

// Log levels
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

// Logger class
export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;

  private constructor() {
    this.logLevel = this.getLogLevelFromString(CONFIG.LOGGING.LEVEL);
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private getLogLevelFromString(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case "error":
        return LogLevel.ERROR;
      case "warn":
        return LogLevel.WARN;
      case "info":
        return LogLevel.INFO;
      case "debug":
        return LogLevel.DEBUG;
      default:
        return LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | ${JSON.stringify(data)}` : "";
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${dataStr}`;
  }

  public error(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage("ERROR", message, data));
    }
  }

  public warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage("WARN", message, data));
    }
  }

  public info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage("INFO", message, data));
    }
  }

  public debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage("DEBUG", message, data));
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();
