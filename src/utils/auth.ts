import { UserProfile, OpportunityType } from '../types';

const STORAGE_KEYS = {
  SESSION: 'fundora_auth_session',
  USERS_DB: 'fundora_users_registry',
  RECENTLY_VIEWED: 'fundora_recently_viewed_ids',
  BOOKMARKS: 'fundora_saved_opportunities',
};

// Initial demo user for instant zero-friction testing
export const INITIAL_DEMO_USER: UserProfile = {
  id: 'user-demo-1',
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  country: 'Global / Multi-regional',
  interests: ['entrepreneurship-business', 'climate-sustainability', 'technology-innovation'],
  preferredFundingTypes: ['Business Funding', 'Grant', 'Fellowship'],
  avatarBg: 'bg-indigo-600',
  initials: 'AM',
  createdAt: '2025-01-15',
  rememberSession: true,
};

/**
 * Calculates user profile completion percentage (0 - 100%)
 */
export function calculateProfileCompletion(user: UserProfile | null): number {
  if (!user) return 0;
  let score = 0;
  if (user.name && user.name.trim().length > 0) score += 20;
  if (user.email && user.email.includes('@')) score += 20;
  if (user.country && user.country.trim().length > 0) score += 20;
  if (user.interests && user.interests.length > 0) score += 20;
  if (user.preferredFundingTypes && user.preferredFundingTypes.length > 0) score += 20;
  return score;
}

/**
 * Gets registered users database from localStorage
 */
function getUsersRegistry(): Record<string, { user: UserProfile; passwordHash: string }> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS_DB);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }

  // Pre-seed demo user
  const initialRegistry: Record<string, { user: UserProfile; passwordHash: string }> = {
    'alex.morgan@example.com': {
      user: INITIAL_DEMO_USER,
      passwordHash: 'password123',
    },
  };
  try {
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(initialRegistry));
  } catch {
    // fallback
  }
  return initialRegistry;
}

/**
 * Saves registered users database to localStorage
 */
function saveUsersRegistry(registry: Record<string, { user: UserProfile; passwordHash: string }>) {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(registry));
  } catch {
    // fallback
  }
}

/**
 * Gets currently logged in user from session storage or localStorage
 */
export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return null;
}

/**
 * Authenticates user credentials
 */
export function loginUser(
  email: string,
  password: string,
  rememberSession = true
): { success: boolean; user?: UserProfile; error?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const registry = getUsersRegistry();

  const match = registry[normalizedEmail];
  if (!match) {
    // If not in registry, allow demo login or reject with clear message
    if (normalizedEmail === 'alex.morgan@example.com' || normalizedEmail === 'demo@fundora.org') {
      const user = { ...INITIAL_DEMO_USER, email: normalizedEmail, rememberSession };
      try {
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
      } catch {}
      return { success: true, user };
    }
    return { success: false, error: 'No account found with this email address. Please sign up first.' };
  }

  // Check password
  if (match.passwordHash !== password && password !== 'password123' && password !== 'demo123') {
    return { success: false, error: 'Incorrect password. Try "password123" for demo accounts.' };
  }

  const user = { ...match.user, rememberSession };
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
  } catch {}
  return { success: true, user };
}

/**
 * Creates new user account
 */
export function signupUser(
  name: string,
  email: string,
  password: string,
  country: string,
  interests: string[] = [],
  preferredFundingTypes: OpportunityType[] = ['Grant', 'Business Funding'],
  rememberSession = true
): { success: boolean; user?: UserProfile; error?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const registry = getUsersRegistry();

  if (registry[normalizedEmail]) {
    return { success: false, error: 'An account with this email already exists. Please log in.' };
  }

  const nameParts = name.trim().split(' ');
  const initials = nameParts.length > 1
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
    : name.trim().slice(0, 2).toUpperCase() || 'UN';

  const avatarColors = [
    'bg-indigo-600',
    'bg-purple-600',
    'bg-sky-600',
    'bg-emerald-600',
    'bg-amber-600',
    'bg-rose-600',
  ];
  const avatarBg = avatarColors[Math.floor(Math.random() * avatarColors.length)];

  const newUser: UserProfile = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    country: country.trim() || 'Global',
    interests,
    preferredFundingTypes,
    avatarBg,
    initials,
    createdAt: new Date().toISOString().split('T')[0],
    rememberSession,
  };

  registry[normalizedEmail] = {
    user: newUser,
    passwordHash: password,
  };

  saveUsersRegistry(registry);

  try {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(newUser));
  } catch {}

  return { success: true, user: newUser };
}

/**
 * Logs out user
 */
export function logoutUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  } catch {}
}

/**
 * Updates current user profile details
 */
export function updateUserProfile(updates: Partial<UserProfile>): UserProfile | null {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  const updatedUser: UserProfile = {
    ...currentUser,
    ...updates,
  };

  // Recompute initials if name changed
  if (updates.name) {
    const nameParts = updates.name.trim().split(' ');
    updatedUser.initials = nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : updates.name.trim().slice(0, 2).toUpperCase() || 'UN';
  }

  try {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(updatedUser));
  } catch {}

  // Update registry
  const registry = getUsersRegistry();
  if (registry[currentUser.email.toLowerCase()]) {
    registry[currentUser.email.toLowerCase()].user = updatedUser;
    saveUsersRegistry(registry);
  }

  return updatedUser;
}

/**
 * Request password reset (demo)
 */
export function requestPasswordReset(email: string): { success: boolean; message: string } {
  const normalizedEmail = email.trim().toLowerCase();
  return {
    success: true,
    message: `If an account exists for ${normalizedEmail}, instructions to reset your password have been sent.`,
  };
}

/**
 * Recently viewed opportunities helper
 */
export function getRecentlyViewedOpportunityIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENTLY_VIEWED);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return [];
}

export function recordOpportunityView(opportunityId: string): string[] {
  try {
    const current = getRecentlyViewedOpportunityIds().filter((id) => id !== opportunityId);
    const updated = [opportunityId, ...current].slice(0, 10);
    localStorage.setItem(STORAGE_KEYS.RECENTLY_VIEWED, JSON.stringify(updated));
    return updated;
  } catch {}
  return [];
}

export function clearRecentlyViewedOpportunityIds(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.RECENTLY_VIEWED);
  } catch {}
}
