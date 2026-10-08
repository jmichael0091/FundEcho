/**
 * FUNDORA - AUTHENTICATION ROUTE GUARD (STEP 18)
 * Protects seeker and administrative routes against unauthorized access,
 * provides seamless navigation redirects, and explains required access.
 */

import React from 'react';
import { Lock, ShieldAlert, ArrowRight, Sparkles, UserCheck, ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '../ui/Button';
import { PageId, UserProfile } from '../../types';

interface AuthRouteGuardProps {
  page: PageId;
  user: UserProfile | null;
  isLoading: boolean;
  onNavigate: (page: PageId) => void;
  onQuickDemoLogin?: () => void;
  children: React.ReactNode;
}

const PROTECTED_PAGES: Record<string, { title: string; description: string; requiresAdmin?: boolean }> = {
  dashboard: {
    title: 'Seeker Dashboard',
    description: 'Sign in to monitor your matching opportunities, application pipeline, and deadline calendar.',
  },
  saved: {
    title: 'Saved Opportunities',
    description: 'Sign in to access and manage your bookmarked funding grants, fellowships, and business competitions.',
  },
  profile: {
    title: 'Seeker Profile & Preferences',
    description: 'Sign in to configure your funding eligibility criteria, target sectors, and matching algorithms.',
  },
  settings: {
    title: 'Account Settings',
    description: 'Sign in to manage your login credentials, notifications, and security options.',
  },
  'application-workspace': {
    title: 'Application Workspace',
    description: 'Sign in to draft, review, and track submissions for active funding opportunities.',
  },
  recommended: {
    title: 'Personalized Recommendations',
    description: 'Sign in to see opportunities tailored to your applicant profile, geography, and funding requirements.',
  },
  admin: {
    title: 'Administrator Console',
    description: 'Elevated administrative credentials are required to manage catalog listings and verification pipelines.',
    requiresAdmin: true,
  },
};

export const AuthRouteGuard: React.FC<AuthRouteGuardProps> = ({
  page,
  user,
  isLoading,
  onNavigate,
  onQuickDemoLogin,
  children,
}) => {
  const protection = PROTECTED_PAGES[page];

  // If page is not protected, allow rendering immediately
  if (!protection) {
    return <>{children}</>;
  }

  // Show subtle loading skeleton while session is verified
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Verifying session credentials...</p>
        </div>
      </div>
    );
  }

  // 1. User is not logged in
  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-100 dark:border-indigo-900 shadow-xs">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
              Authentication Required
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {protection.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {protection.description}
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full justify-center gap-2 text-sm font-bold shadow-md shadow-indigo-600/20"
              onClick={() => onNavigate('login')}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Continue</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full justify-center gap-2 text-sm font-bold"
              onClick={() => onNavigate('signup')}
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Create Free Seeker Account</span>
            </Button>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Directory</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Admin Route Protection: If requiresAdmin, verify user is an authorized admin
  const isUserAdmin = Boolean(
    user && (
      user.role === 'admin' ||
      user.role === 'superAdmin' ||
      user.email?.toLowerCase() === 'jmichrepublic@gmail.com' ||
      user.email?.toLowerCase() === 'admin@fundecho.org' ||
      user.email?.toLowerCase() === 'admin@fundora.org'
    )
  );

  if (protection.requiresAdmin && !isUserAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-amber-200 dark:border-amber-900/60 p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-100 dark:border-amber-900 shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-amber-600 dark:text-amber-400">
              Access Restricted
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Administrator Privileges Required
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              You are currently signed in as <strong className="text-slate-900 dark:text-white">{user.name}</strong> ({user.email}) with role <span className="capitalize font-semibold text-indigo-600 dark:text-indigo-400">{user.role || 'seeker'}</span>. This console is reserved for authorized platform administrators.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full justify-center gap-2 text-sm font-bold shadow-md shadow-amber-600/20"
              onClick={() => onNavigate('login')}
            >
              <LogIn className="w-4 h-4" />
              <span>Switch / Sign In as Administrator</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full justify-center gap-2 text-sm font-bold"
              onClick={() => onNavigate('dashboard')}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Seeker Dashboard</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // User is authorized
  return <>{children}</>;
};
