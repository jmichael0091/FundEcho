/**
 * FUNDORA - DATABASE TIMESTAMPS UTILITIES (STEP 17)
 * Reusable utilities for handling server timestamps, Firestore Timestamps,
 * Date conversions, audit records, and deadline evaluations.
 */

import { Timestamp, serverTimestamp, FieldValue } from 'firebase/firestore';

/**
 * Returns a server timestamp Sentinel for Firestore write operations.
 * Use for createdAt, updatedAt, verifiedAt, and immutable ledger timestamps.
 */
export function getServerTimestamp(): FieldValue {
  return serverTimestamp();
}

/**
 * Safely converts any timestamp representation into a standard JavaScript Date.
 * Supports Firestore Timestamp, FieldValue, JS Date, ISO string, or numeric epoch.
 */
export function toDate(value: any): Date | null {
  if (!value) return null;
  
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  
  // Firestore Timestamp object
  if (typeof value === 'object' && typeof value.toDate === 'function') {
    return value.toDate();
  }
  
  // Seconds/nanoseconds object format
  if (typeof value === 'object' && typeof value.seconds === 'number') {
    return new Date(value.seconds * 1000 + (value.nanoseconds || 0) / 1000000);
  }
  
  // String or number
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  
  return null;
}

/**
 * Safely converts any timestamp representation to an ISO 8601 string.
 */
export function toISOString(value: any): string {
  const date = toDate(value);
  return date ? date.toISOString() : new Date().toISOString();
}

/**
 * Safely converts any valid date into a Firestore Timestamp object.
 */
export function toFirestoreTimestamp(value: Date | string | number | Timestamp | null | undefined): Timestamp {
  if (value instanceof Timestamp) {
    return value;
  }
  const date = toDate(value) || new Date();
  return Timestamp.fromDate(date);
}

/**
 * Formats a timestamp into human-readable date display (e.g. "Oct 24, 2026").
 */
export function formatDateDisplay(
  value: any,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
): string {
  const date = toDate(value);
  if (!date) return 'N/A';
  try {
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Formats a timestamp into relative time (e.g. "2 hours ago", "in 5 days").
 */
export function formatRelativeTime(value: any): string {
  const date = toDate(value);
  if (!date) return 'Unknown';
  
  const now = Date.now();
  const diffMs = date.getTime() - now;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHours = Math.round(diffMin / 60);
  const diffDays = Math.round(diffHours / 24);

  if (Math.abs(diffSec) < 60) return 'Just now';
  if (Math.abs(diffMin) < 60) {
    return diffMin > 0 ? `In ${diffMin}m` : `${Math.abs(diffMin)}m ago`;
  }
  if (Math.abs(diffHours) < 24) {
    return diffHours > 0 ? `In ${diffHours}h` : `${Math.abs(diffHours)}h ago`;
  }
  if (Math.abs(diffDays) < 30) {
    return diffDays > 0 ? `In ${diffDays}d` : `${Math.abs(diffDays)}d ago`;
  }
  return formatDateDisplay(date);
}

/**
 * Evaluates whether a given deadline has passed.
 */
export function isDeadlinePassed(deadline: any): boolean {
  const date = toDate(deadline);
  if (!date) return false;
  return date.getTime() < Date.now();
}

/**
 * Computes remaining whole calendar days until a deadline.
 * Returns negative if the deadline has expired.
 */
export function getDaysRemaining(deadline: any): number {
  const date = toDate(deadline);
  if (!date) return 0;
  const diffTime = date.getTime() - Date.now();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
