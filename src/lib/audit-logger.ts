/**
 * RestoPulse — Audit & Event Logging Subsystem
 * 
 * Records critical point-of-sale actions, cloud synchronization events,
 * and security audits both locally (localStorage / memory) and for console diagnostics.
 */

export type AuditLogLevel = "info" | "warn" | "error" | "security";

export type AuditLogEntry = {
  id: string;
  timestamp: string;
  level: AuditLogLevel;
  category: "POS" | "SYNC" | "AUTH" | "STOCK" | "PRINTER" | "SYSTEM";
  message: string;
  details?: Record<string, any> | undefined;
  userId?: string | undefined;
  branchId?: string | undefined;
};

const LOG_STORAGE_KEY = "restopulse_audit_logs_v1";
const MAX_LOGS_KEPT = 200;

export function logAuditEvent(
  level: AuditLogLevel,
  category: AuditLogEntry["category"],
  message: string,
  details?: Record<string, any>
): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    details,
    userId: typeof window !== "undefined" ? (localStorage.getItem("spotlight_auth_user") || "anonymous") : "server",
    branchId: typeof window !== "undefined" ? (localStorage.getItem("spotlight_auth_branch") || "taramani") : "taramani",
  };

  // Console output
  const prefix = `[RestoPulse ${entry.category}]`;
  if (level === "error") {
    console.error(prefix, message, details);
  } else if (level === "warn") {
    console.warn(prefix, message, details);
  } else {
    console.info(prefix, message, details);
  }

  // Persist into circular buffer in browser storage
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOG_STORAGE_KEY);
      const existing: AuditLogEntry[] = raw ? JSON.parse(raw) : [];
      existing.unshift(entry);
      if (existing.length > MAX_LOGS_KEPT) {
        existing.length = MAX_LOGS_KEPT;
      }
      localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(existing));
    } catch {
      // ignore storage quota issues
    }
  }

  return entry;
}

export function getAuditLogs(): AuditLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOG_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearAuditLogs(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(LOG_STORAGE_KEY);
  }
}
