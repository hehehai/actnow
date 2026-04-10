import { hashPassword as hashBetterAuthPassword } from "@actnow/auth/crypto";
import { and, asc, desc, type SQL, sql } from "@actnow/db";
import { ORPCError } from "@orpc/server";
import type { ApiDb } from "./context-types";

const SQLITE_FIELD_REGEX =
  /(?:UNIQUE|NOT NULL) constraint failed: [^.]+\.(.+)$/i;

// Pagination types
export interface PaginationInput {
  page: number;
  pageSize: number;
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Calculate pagination offset
export function getPaginationOffset(input: PaginationInput): number {
  return (input.page - 1) * input.pageSize;
}

// Build pagination result
export function buildPaginationResult<T>(
  items: T[],
  total: number,
  input: PaginationInput
): PaginationResult<T> {
  return {
    items,
    total,
    page: input.page,
    pageSize: input.pageSize,
    totalPages: Math.ceil(total / input.pageSize),
  };
}

// Sort order helper
export function getSortOrder(
  column: Parameters<typeof asc>[0],
  order: "asc" | "desc" = "desc"
) {
  return order === "asc" ? asc(column) : desc(column);
}

export function combineFilters(
  conditions: Array<SQL | undefined>
): SQL | undefined {
  const filters = conditions.filter((condition): condition is SQL =>
    Boolean(condition)
  );

  return filters.length > 0 ? and(...filters) : undefined;
}

// Get count from query result
export function getCountFromResult(
  result: { count: number }[] | undefined
): number {
  return result?.[0]?.count ?? 0;
}

// Get row count for a table with optional where clause
export async function getTableCount(
  db: ApiDb,
  table: Parameters<ReturnType<ApiDb["select"]>["from"]>[0],
  whereClause?: SQL
): Promise<number> {
  const query = db.select({ count: sql<number>`COUNT(*)` }).from(table);
  const rows = whereClause ? await query.where(whereClause) : await query;
  return Number(rows?.[0]?.count ?? 0);
}

// Time range types for stats
export type StatPeriod = "24h" | "7d" | "15d" | "30d";

export interface TimeRange {
  currentStart: Date;
  previousStart: Date;
  previousEnd: Date;
}

// Period to milliseconds mapping
const PERIOD_MS: Record<StatPeriod, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "15d": 15 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

// Get time range for stats comparison
export function getTimeRange(period: StatPeriod): TimeRange {
  const now = new Date();
  const ms = PERIOD_MS[period];
  const currentStart = new Date(now.getTime() - ms);
  const previousStart = new Date(currentStart.getTime() - ms);

  return {
    currentStart,
    previousStart,
    previousEnd: currentStart,
  };
}

// Calculate percentage change between two periods
export function calculateChangePercent(
  current: number,
  previous: number
): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100 * 100) / 100;
}

// Generate a unique ID using crypto
export function generateId(): string {
  return crypto.randomUUID();
}

// Hash password using Better Auth's credential format
export async function hashPassword(password: string): Promise<string> {
  return hashBetterAuthPassword(password);
}

interface SqliteError {
  code?: string;
  message?: string;
  detail?: string;
}

function isSqliteError(error: unknown): error is SqliteError {
  return (
    typeof error === "object" &&
    error !== null &&
    ("message" in error || "code" in error)
  );
}

function extractFieldFromMessage(message?: string): string | null {
  if (!message) return null;
  const match = message.match(SQLITE_FIELD_REGEX);
  return match?.[1] ?? null;
}

// Handle database errors and convert to ORPCError
export function handleDbError(error: unknown): never {
  const dbError =
    error && typeof error === "object" && "cause" in error
      ? (error as { cause: unknown }).cause
      : error;

  if (isSqliteError(dbError)) {
    const message = dbError.message ?? "";

    if (
      dbError.code === "SQLITE_CONSTRAINT_UNIQUE" ||
      message.includes("UNIQUE constraint failed")
    ) {
      const field = extractFieldFromMessage(message);
      const errorMessage = field
        ? `${field} already exists`
        : "Record already exists";
      throw new ORPCError("CONFLICT", { message: errorMessage });
    }

    if (
      dbError.code === "SQLITE_CONSTRAINT_FOREIGNKEY" ||
      message.includes("FOREIGN KEY constraint failed")
    ) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Referenced record does not exist",
      });
    }

    if (
      dbError.code === "SQLITE_CONSTRAINT_NOTNULL" ||
      message.includes("NOT NULL constraint failed")
    ) {
      const field = extractFieldFromMessage(message);
      throw new ORPCError("BAD_REQUEST", {
        message: field ? `${field} is required` : "Required field is missing",
      });
    }
  }

  throw error;
}
