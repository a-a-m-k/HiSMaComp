type LogLevel = "debug" | "info" | "warn" | "error";

interface Logger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

const isDevelopment = import.meta.env.DEV;

class AppLogger implements Logger {
  private shouldLog(level: LogLevel): boolean {
    if (isDevelopment) return true;
    return level === "error";
  }

  debug(...args: unknown[]): void {
    if (this.shouldLog("debug")) {
      console.debug("[DEBUG]", ...args);
    }
  }

  info(...args: unknown[]): void {
    if (this.shouldLog("info")) {
      console.info("[INFO]", ...args);
    }
  }

  warn(...args: unknown[]): void {
    if (this.shouldLog("warn")) {
      console.warn("[WARN]", ...args);
    }
  }

  error(...args: unknown[]): void {
    if (this.shouldLog("error")) {
      console.error("[ERROR]", ...args);
    }
  }
}

export const logger = new AppLogger();
