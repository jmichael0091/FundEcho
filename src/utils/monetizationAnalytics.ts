import { MonetizationEvent, MonetizationEventType } from '../types/monetization';

const STORAGE_KEY = 'fundora_monetization_analytics_events';
const MAX_STORED_EVENTS = 50;

type AnalyticsListener = (event: MonetizationEvent) => void;
const listeners: Set<AnalyticsListener> = new Set();

/**
 * In-memory buffer for the active session
 */
let sessionEvents: MonetizationEvent[] = [];

/**
 * Load persisted recent events from localStorage (for demo inspection)
 */
export function getStoredMonetizationEvents(): MonetizationEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Track a privacy-preserving monetization event.
 * Collects zero PII (Personally Identifiable Information).
 */
export function trackMonetizationEvent(
  type: MonetizationEventType, 
  data: Record<string, string | number | boolean | undefined> = {}
): MonetizationEvent {
  const event: MonetizationEvent = {
    id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type,
    timestamp: new Date().toISOString(),
    data: {
      ...data,
      path: typeof window !== 'undefined' ? window.location.pathname : '',
      viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 0
    }
  };

  sessionEvents.push(event);

  // Notify listeners
  listeners.forEach(listener => {
    try {
      listener(event);
    } catch {
      // Ignore listener errors
    }
  });

  // Persist capped list in localStorage for developer/demo visibility
  try {
    const existing = getStoredMonetizationEvents();
    const updated = [event, ...existing].slice(0, MAX_STORED_EVENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors
  }

  // Developer friendly log
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`[Monetization Analytics] ${type}:`, event.data);
  }

  return event;
}

/**
 * Subscribe to real-time monetization events
 */
export function subscribeToMonetizationEvents(listener: AnalyticsListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Clear analytics events (for testing)
 */
export function clearMonetizationEvents(): void {
  sessionEvents = [];
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
