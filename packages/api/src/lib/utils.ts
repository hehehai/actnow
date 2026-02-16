import { hashPassword as hashBetterAuthPassword } from "@actnow/auth/crypto";
import { asc, desc, type PgColumn, sql } from "@actnow/db";
import { ORPCError } from "@orpc/server";

// Regex for extracting field name from PostgreSQL unique constraint error
const POSTGRES_KEY_FIELD_REGEX = /Key \(([^)]+)\)=/;

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
export function getSortOrder(column: PgColumn, order: "asc" | "desc" = "desc") {
  return order === "asc" ? asc(column) : desc(column);
}

// Get count from query result
export function getCountFromResult(
  result: { count: number }[] | undefined
): number {
  return result?.[0]?.count ?? 0;
}

// Get row count for a table with optional where clause
export async function getTableCount(
  db: any,
  table: any,
  whereClause?: any
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

// PostgreSQL error interface
interface PostgresError {
  code?: string;
  detail?: string;
  constraint?: string;
}

// Check if error is a PostgreSQL error
function isPostgresError(error: unknown): error is PostgresError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as PostgresError).code === "string"
  );
}

// Extract field name from PostgreSQL unique constraint error detail
function extractFieldFromDetail(detail?: string): string | null {
  if (!detail) return null;
  // Pattern: "Key (field)=(value) already exists."
  const match = detail.match(POSTGRES_KEY_FIELD_REGEX);
  return match?.[1] ?? null;
}

// Handle database errors and convert to ORPCError
export function handleDbError(error: unknown): never {
  // Drizzle wraps PostgreSQL errors in DrizzleQueryError with the actual error in .cause
  const dbError =
    error && typeof error === "object" && "cause" in error
      ? (error as { cause: unknown }).cause
      : error;

  if (isPostgresError(dbError)) {
    // Unique constraint violation
    if (dbError.code === "23505") {
      const field = extractFieldFromDetail(dbError.detail);
      const message = field
        ? `${field} already exists`
        : "Record already exists";
      throw new ORPCError("CONFLICT", { message });
    }

    // Foreign key violation
    if (dbError.code === "23503") {
      throw new ORPCError("BAD_REQUEST", {
        message: "Referenced record does not exist",
      });
    }

    // Not null violation
    if (dbError.code === "23502") {
      throw new ORPCError("BAD_REQUEST", {
        message: "Required field is missing",
      });
    }
  }

  // Re-throw unknown errors
  throw error;
}
