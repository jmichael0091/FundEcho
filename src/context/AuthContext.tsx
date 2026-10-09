/**
 * FUNDORA - AUTHENTICATION CONTEXT & STATE MANAGER (STEP 18)
 * Centralized Firebase Authentication state, persistent sessions,
 * user profile hydration, route protection, and security management.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile } from '../types';
import {
  registerWithFirebase,
  loginWithFirebase,
  logoutFromFirebase,
  sendFirebasePasswordReset,
  updateFirebaseUserProfile,
  subscribeToAuthAndProfile,
  fetchUserProfileByUid,
  signInWithGoogleProvider,
  RegisterParams,
  AuthResult,
} from '../services/firebase/authService';
import { isFirebaseConfigured } from '../services/firebase/firebaseConfig';
import { syncUserDocumentToFirestore } from '../services/firebase/firestoreService';
import { getCurrentUser, loginUser, signupUser, logoutUser, updateUserProfile as updateLocalProfile } from '../utils/auth';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthContextValue {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  authStatus: AuthStatus;
  isLoading: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isSeeker: boolean;
  authError: string | null;
  clearAuthError: () => void;
  login: (email: string, password: string, rememberSession?: boolean) => Promise<AuthResult>;
  register: (params: RegisterParams) => Promise<AuthResult>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile | null>;
  refreshProfile: () => Promise<void>;
  signInWithGoogle: () => Promise<AuthResult>;
  quickDemoLogin: () => Promise<AuthResult>;
  quickAdminLogin: () => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Initial optimistic hydrate from local cache while Firebase boots
    return getCurrentUser();
  });
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Listen to authoritative Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthAndProfile((hydratedUser, fbUser, loading) => {
      setFirebaseUser(fbUser);
      if (fbUser && hydratedUser) {
        setUser(hydratedUser);
        // Sync to local session cache for fast recovery
        try {
          localStorage.setItem('fundora_auth_session', JSON.stringify(hydratedUser));
        } catch {}
      } else if (!fbUser && !loading) {
        // Clear if confirmed unauthenticated by Firebase
        setUser(null);
        try {
          localStorage.removeItem('fundora_auth_session');
        } catch {}
      }
      setIsLoading(loading);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(
    async (email: string, password: string, rememberSession = true): Promise<AuthResult> => {
      setAuthError(null);
      setIsLoading(true);

      try {
        const result = await loginWithFirebase(email, password, rememberSession);
        if (result.success && result.user) {
          setUser(result.user);
          setFirebaseUser(result.firebaseUser || null);
          try {
            localStorage.setItem('fundora_auth_session', JSON.stringify(result.user));
          } catch {}
          setIsLoading(false);
          return result;
        } else {
          // If Firebase Auth provider is unavailable (e.g. configuration-not-found, api-key-not-valid)
          const isConfigIssue =
            result.code === 'auth/configuration-not-found' ||
            result.code === 'auth/operation-not-allowed' ||
            result.code === 'auth/api-key-not-valid' ||
            result.error?.includes('configuration-not-found') ||
            result.error?.includes('api-key-not-valid');

          if (isConfigIssue) {
            console.warn('[AuthContext] Firebase Auth provider unavailable, attempting local user fallback.');
            const localRes = loginUser(email, password, rememberSession);
            if (localRes.success && localRes.user) {
              const isAdminEmail =
                email.trim().toLowerCase() === 'jmichrepublic@gmail.com' ||
                email.trim().toLowerCase() === 'admin@fundecho.org' ||
                email.trim().toLowerCase() === 'admin@fundora.org';
              if (isAdminEmail) {
                localRes.user.role = 'admin';
              }
              setUser(localRes.user);
              try {
                localStorage.setItem('fundora_auth_session', JSON.stringify(localRes.user));
              } catch {}
              setIsLoading(false);
              return { success: true, user: localRes.user };
            }
          }

          setAuthError(result.error || 'Authentication failed. Please check your credentials.');
          setIsLoading(false);
          return result;
        }
      } catch (err: any) {
        // Fallback to local user
        const localRes = loginUser(email, password, rememberSession);
        if (localRes.success && localRes.user) {
          const isAdminEmail =
            email.trim().toLowerCase() === 'jmichrepublic@gmail.com' ||
            email.trim().toLowerCase() === 'admin@fundecho.org' ||
            email.trim().toLowerCase() === 'admin@fundora.org';
          if (isAdminEmail) {
            localRes.user.role = 'admin';
          }
          setUser(localRes.user);
          try {
            localStorage.setItem('fundora_auth_session', JSON.stringify(localRes.user));
          } catch {}
          setIsLoading(false);
          return { success: true, user: localRes.user };
        }
        const msg = err?.message || 'Login error occurred.';
        setAuthError(msg);
        setIsLoading(false);
        return { success: false, error: msg };
      }
    },
    []
  );

  const register = useCallback(
    async (params: RegisterParams): Promise<AuthResult> => {
      setAuthError(null);
      setIsLoading(true);

      try {
        const result = await registerWithFirebase(params);
        if (result.success && result.user) {
          setUser(result.user);
          setFirebaseUser(result.firebaseUser || null);
          try {
            localStorage.setItem('fundora_auth_session', JSON.stringify(result.user));
          } catch {}
          setIsLoading(false);
          return result;
        } else {
          const isConfigIssue =
            result.code === 'auth/configuration-not-found' ||
            result.code === 'auth/operation-not-allowed' ||
            result.code === 'auth/api-key-not-valid' ||
            result.error?.includes('configuration-not-found') ||
            result.error?.includes('api-key-not-valid');

          if (isConfigIssue) {
            console.warn('[AuthContext] Firebase Auth provider unavailable, attempting local user registration.');
            const localRes = signupUser(
              params.name,
              params.email,
              params.password,
              params.country,
              params.interests || [],
              params.preferredFundingTypes || ['Grant', 'Business Funding'],
              params.rememberSession ?? true
            );
            if (localRes.success && localRes.user) {
              const isAdminEmail =
                params.email.trim().toLowerCase() === 'jmichrepublic@gmail.com' ||
                params.email.trim().toLowerCase() === 'admin@fundecho.org' ||
                params.email.trim().toLowerCase() === 'admin@fundora.org';
              if (isAdminEmail) {
                localRes.user.role = 'admin';
              }
              setUser(localRes.user);
              try {
                localStorage.setItem('fundora_auth_session', JSON.stringify(localRes.user));
              } catch {}
              setIsLoading(false);
              return { success: true, user: localRes.user };
            }
          }

          setAuthError(result.error || 'Registration failed. Please check the details provided.');
          setIsLoading(false);
          return result;
        }
      } catch (err: any) {
        const localRes = signupUser(
          params.name,
          params.email,
          params.password,
          params.country,
          params.interests || [],
          params.preferredFundingTypes || ['Grant', 'Business Funding'],
          params.rememberSession ?? true
        );
        if (localRes.success && localRes.user) {
          const isAdminEmail =
            params.email.trim().toLowerCase() === 'jmichrepublic@gmail.com' ||
            params.email.trim().toLowerCase() === 'admin@fundecho.org' ||
            params.email.trim().toLowerCase() === 'admin@fundora.org';
          if (isAdminEmail) {
            localRes.user.role = 'admin';
          }
          setUser(localRes.user);
          try {
            localStorage.setItem('fundora_auth_session', JSON.stringify(localRes.user));
          } catch {}
          setIsLoading(false);
          return { success: true, user: localRes.user };
        }
        const msg = err?.message || 'Registration error occurred.';
        setAuthError(msg);
        setIsLoading(false);
        return { success: false, error: msg };
      }
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured()) {
        await logoutFromFirebase();
      }
      logoutUser();
      setUser(null);
      setFirebaseUser(null);
    } catch (err) {
      console.error('[AuthContext] Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(
    async (email: string): Promise<{ success: boolean; error?: string }> => {
      if (isFirebaseConfigured()) {
        return sendFirebasePasswordReset(email);
      }
      return { success: true };
    },
    []
  );

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
      if (!user) return null;

      try {
        if (isFirebaseConfigured() && user.id) {
          const updated = await updateFirebaseUserProfile(user.id, updates);
          if (updated) {
            setUser(updated);
            try {
              localStorage.setItem('fundora_auth_session', JSON.stringify(updated));
            } catch {}
            return updated;
          }
        }

        // Local fallback
        const localUpdated = updateLocalProfile(updates);
        if (localUpdated) {
          setUser(localUpdated);
          return localUpdated;
        }
        return null;
      } catch (error) {
        console.error('[AuthContext] Failed to update user profile:', error);
        throw error;
      }
    },
    [user]
  );

  const refreshProfile = useCallback(async (): Promise<void> => {
    if (!user || !user.id || !isFirebaseConfigured()) return;
    try {
      const refreshed = await fetchUserProfileByUid(user.id);
      if (refreshed) {
        setUser(refreshed);
        try {
          localStorage.setItem('fundora_auth_session', JSON.stringify(refreshed));
        } catch {}
      }
    } catch (err) {
      console.error('[AuthContext] Failed to refresh profile:', err);
    }
  }, [user]);

  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const result = await signInWithGoogleProvider();
      if (result.success && result.user) {
        setUser(result.user);
        setFirebaseUser(result.firebaseUser || null);
        try {
          localStorage.setItem('fundora_auth_session', JSON.stringify(result.user));
        } catch {}
      } else {
        setAuthError(result.error || 'Google Sign-In failed.');
      }
      setIsLoading(false);
      return result;
    } catch (err: any) {
      const msg = err?.message || 'Google Sign-In error.';
      setAuthError(msg);
      setIsLoading(false);
      return { success: false, error: msg };
    }
  }, []);

  const quickDemoLogin = useCallback(async (): Promise<AuthResult> => {
    setIsLoading(true);
    setAuthError(null);

    // Try real Firebase login with the seeded demo user first
    const demoEmail = 'alex.morgan@example.com';
    const demoPass = 'FundoraDemo2026!';

    if (isFirebaseConfigured()) {
      try {
        let result = await loginWithFirebase(demoEmail, demoPass, true);
        const isAuthUnavailable =
          result.code === 'auth/configuration-not-found' ||
          result.code === 'auth/api-key-not-valid' ||
          result.code === 'auth/operation-not-allowed' ||
          result.error?.includes('configuration-not-found') ||
          result.error?.includes('api-key-not-valid') ||
          result.error?.includes('operation-not-allowed');

        if (!result.success && !isAuthUnavailable) {
          // If demo user isn't in Firebase Auth yet, auto-register them
          result = await registerWithFirebase({
            name: 'Alex Morgan',
            email: demoEmail,
            password: demoPass,
            country: 'Global / Multi-regional',
            region: 'Global',
            interests: ['entrepreneurship-business', 'climate-sustainability', 'technology-innovation'],
            preferredFundingTypes: ['Business Funding', 'Grant', 'Fellowship'],
            userType: 'Startup Founder',
            businessStage: 'Early Stage',
            industry: 'Climate Tech & AI',
            organizationName: 'Morgan Climate Labs',
            rememberSession: true,
          });
        }

        if (result.success && result.user) {
          setUser(result.user);
          setFirebaseUser(result.firebaseUser || null);
          try {
            localStorage.setItem('fundora_auth_session', JSON.stringify(result.user));
          } catch {}
          setIsLoading(false);
          return result;
        }
      } catch {
        // Fall back to local demo user
      }
    }

    // Fallback to local demo user
    const localRes = loginUser(demoEmail, 'password123', true);
    if (localRes.success && localRes.user) {
      setUser(localRes.user);
      try {
        localStorage.setItem('fundora_auth_session', JSON.stringify(localRes.user));
      } catch {}
      setIsLoading(false);
      return { success: true, user: localRes.user };
    }

    setIsLoading(false);
    return { success: false, error: 'Could not initialize demo user.' };
  }, []);

  const quickAdminLogin = useCallback(async (): Promise<AuthResult> => {
    setIsLoading(true);
    setAuthError(null);

    const adminEmail = 'admin@fundecho.org';
    const adminPass = 'FundEchoAdmin2026!';

    if (isFirebaseConfigured()) {
      try {
        let result = await loginWithFirebase(adminEmail, adminPass, true);
        const isAuthUnavailable =
          result.code === 'auth/configuration-not-found' ||
          result.code === 'auth/api-key-not-valid' ||
          result.code === 'auth/operation-not-allowed' ||
          result.error?.includes('configuration-not-found') ||
          result.error?.includes('api-key-not-valid') ||
          result.error?.includes('operation-not-allowed');

        if (!result.success && !isAuthUnavailable) {
          result = await registerWithFirebase({
            name: 'Elena Rostova (Admin)',
            email: adminEmail,
            password: adminPass,
            country: 'United Kingdom',
            region: 'Europe',
            interests: ['entrepreneurship-business', 'technology-innovation', 'grants'],
            preferredFundingTypes: ['Grant', 'Research Grant', 'Business Funding'],
            userType: 'Platform Administrator',
            businessStage: 'Established',
            industry: 'Institutional Grantmaking',
            organizationName: 'FundEcho Global',
            rememberSession: true,
          });
        }

        if (result.success && result.user) {
          const adminUser: UserProfile = {
            ...result.user,
            role: 'admin',
          };
          setUser(adminUser);
          setFirebaseUser(result.firebaseUser || null);
          try {
            localStorage.setItem('fundora_auth_session', JSON.stringify(adminUser));
          } catch {}
          setIsLoading(false);
          return { ...result, user: adminUser };
        }
      } catch (err) {
        console.warn('[AuthContext] Firebase quickAdminLogin fallback:', err);
      }
    }

    // High-fidelity fallback admin user matching DEMO_ADMIN_USER
    const fallbackAdmin: UserProfile = {
      id: 'admin-fundecho-1',
      name: 'Elena Rostova (Admin)',
      email: 'admin@fundecho.org',
      country: 'United Kingdom',
      region: 'Europe',
      interests: ['entrepreneurship-business', 'technology-innovation', 'grants'],
      preferredFundingTypes: ['Grant', 'Research Grant', 'Business Funding'],
      avatarBg: 'bg-indigo-700',
      initials: 'ER',
      createdAt: '2025-01-01',
      rememberSession: true,
      role: 'admin',
      accountStatus: 'active',
      profileCompletion: 100,
    };

    if (isFirebaseConfigured()) {
      syncUserDocumentToFirestore({
        uid: fallbackAdmin.id,
        fullName: fallbackAdmin.name,
        email: fallbackAdmin.email,
        country: fallbackAdmin.country,
        interests: fallbackAdmin.interests,
        organizationType: 'Platform Administrator',
        profileCompleted: true,
        role: 'admin',
      }).catch(() => {});
    }

    setUser(fallbackAdmin);
    try {
      localStorage.setItem('fundora_auth_session', JSON.stringify(fallbackAdmin));
    } catch {}
    setIsLoading(false);
    return { success: true, user: fallbackAdmin };
  }, []);

  const authStatus: AuthStatus = isLoading
    ? 'loading'
    : user
    ? 'authenticated'
    : 'unauthenticated';

  const isLoggedIn = authStatus === 'authenticated' && !!user;
  const isAdmin = Boolean(
    isLoggedIn && (
      user?.role === 'admin' ||
      user?.role === 'superAdmin' ||
      user?.email?.toLowerCase() === 'jmichael0091@gmail.com' ||
      user?.email?.toLowerCase() === 'jmichrepublic@gmail.com' ||
      user?.email?.toLowerCase() === 'admin@fundecho.org' ||
      user?.email?.toLowerCase() === 'admin@fundora.org'
    )
  );
  const isSeeker = isLoggedIn && !isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        authStatus,
        isLoading,
        isLoggedIn,
        isAdmin,
        isSeeker,
        authError,
        clearAuthError,
        login,
        register,
        logout,
        resetPassword,
        updateProfile,
        refreshProfile,
        signInWithGoogle,
        quickDemoLogin,
        quickAdminLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
