type LogLevel = "debug" | "info" | "warn" | "error";

interface Logger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

const isDevelopment = import.meta.env.DEV;

function isVerboseEnabled(): boolean {
  if (isDevelopment) return true;
  try {
    if (
      typeof localStorage !== "undefined" &&
      localStorage.getItem("hismacomp_verbose") === "1"
    ) {
      return true;
    }
    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : ""
    );
    if (params.get("verbose") === "1" || params.get("verbose") === "true") {
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

class AppLogger implements Logger {
  private shouldLog(level: LogLevel): boolean {
    if (isDevelopment) return true;
    if (level === "error") return true;
    return isVerboseEnabled();
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
