import React, { useState } from 'react';
import { 
  Settings, 
  Lock, 
  ShieldCheck, 
  Trash2, 
  Download, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Moon, 
  Sun, 
  ArrowLeft,
  ChevronRight,
  Eye,
  Key,
  RotateCcw,
  Shield,
  ExternalLink
} from 'lucide-react';
import { UserProfile, PageId, Theme, Opportunity } from '../types';
import { Button } from '../components/ui/Button';
import { updateUserProfile, clearRecentlyViewedOpportunityIds } from '../utils/auth';
import { NotificationPreferencesSection } from '../components/notifications/NotificationPreferencesSection';

export interface SettingsPageProps {
  user: UserProfile;
  allOpportunities: Opportunity[];
  bookmarkedIds: Set<string>;
  onNavigate: (page: PageId) => void;
  onLogout: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  onClearHistory: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  allOpportunities,
  bookmarkedIds,
  onNavigate,
  onLogout,
  theme,
  onToggleTheme,
  onClearHistory,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [historyCleared, setHistoryCleared] = useState(false);
  const [rememberSession, setRememberSession] = useState(user.rememberSession !== false);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!currentPassword) {
      setPasswordMsg({ type: 'error', text: 'Please enter your current password.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setTimeout(() => {
      setPasswordMsg({ type: 'success', text: 'Password successfully updated (demo).' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 200);
  };

  const handleToggleRemember = () => {
    const nextVal = !rememberSession;
    setRememberSession(nextVal);
    updateUserProfile({ rememberSession: nextVal });
  };

  const handleClearBrowsingHistory = () => {
    clearRecentlyViewedOpportunityIds();
    onClearHistory();
    setHistoryCleared(true);
    setTimeout(() => setHistoryCleared(false), 2500);
  };

  const handleExportSaved = () => {
    const saved = allOpportunities.filter((o) => bookmarkedIds.has(o.id));
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(saved, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `fundecho_saved_opportunities_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 overflow-x-clip">
      {/* 1. BREADCRUMB */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Dashboard
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 dark:text-white">Account Settings</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('dashboard')}
          leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
        >
          Back to Dashboard
        </Button>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Account Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage your session preferences, security credentials, and data history.
          </p>
        </div>

        {/* 1. Account Summary Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-md shadow-slate-200/40 dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Account Identity
            </h2>
            <Button
              variant="outline"
              size="xs"
              onClick={() => onNavigate('profile')}
            >
              Edit Profile
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="space-y-0.5">
              <span className="text-slate-400 font-medium">Full Name:</span>
              <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 font-medium">Account Email:</span>
              <p className="font-bold text-slate-900 dark:text-white">{user.email}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 font-medium">Geography:</span>
              <p className="font-bold text-slate-900 dark:text-white">{user.country}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 font-medium">Saved Opportunities:</span>
              <p className="font-bold text-indigo-600 dark:text-indigo-400">{bookmarkedIds.size} saved items</p>
            </div>
          </div>
        </div>

        {/* 2. Display & Appearance */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-md shadow-slate-200/40 dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            Display & Session Preferences
          </h2>

          <div className="space-y-4 text-xs sm:text-sm">
            {/* Theme Toggle Option */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Theme Mode</span>
                <span className="text-slate-500 dark:text-slate-400 text-xs">
                  Currently using {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleTheme}
                leftIcon={theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              >
                Switch to {theme === 'dark' ? 'Light' : 'Dark'}
              </Button>
            </div>

            {/* Remember Session Toggle */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Persistent Session</span>
                <span className="text-slate-500 dark:text-slate-400 text-xs">
                  Keep me signed in across browser reloads
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleRemember}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  rememberSession ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                }`}
                role="switch"
                aria-checked={rememberSession}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    rememberSession ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Security Credentials (Change Password) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-md shadow-slate-200/40 dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Security & Password
          </h2>

          {passwordMsg && (
            <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
              passwordMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
            }`}>
              {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password (demo: password123)"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="sm">
              Update Password
            </Button>
          </form>
        </div>

        {/* 4. Notification & Deadline Alert Preferences */}
        <NotificationPreferencesSection />

        {/* 5. Data Management & History */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-md shadow-slate-200/40 dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Data Management & Export
          </h2>

          <div className="space-y-3">
            {/* Export Saved Opportunities */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Export Saved Opportunities (JSON)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Download a structured file containing all your {bookmarkedIds.size} saved grants.
                </span>
              </div>
              <Button
                variant="outline"
                size="xs"
                onClick={handleExportSaved}
                disabled={bookmarkedIds.size === 0}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Export JSON
              </Button>
            </div>

            {/* Clear History */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Clear Recently Viewed History
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {historyCleared ? 'History cleared!' : 'Remove cached viewed opportunities from your local dashboard.'}
                </span>
              </div>
              <Button
                variant="outline"
                size="xs"
                onClick={handleClearBrowsingHistory}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                {historyCleared ? 'Cleared' : 'Clear History'}
              </Button>
            </div>
          </div>
        </div>

        {/* 5. Platform Administration Link */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl border border-indigo-800 p-6 sm:p-7 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                Staff & Editorial Portal
              </span>
            </div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              FundEcho Admin Console
            </h2>
            <p className="text-xs text-indigo-200/80 max-w-md">
              Publish and moderate opportunities, oversee categories, manage user roles, and monitor review pipelines.
            </p>
          </div>

          <Button
            id="settings-admin-portal-btn"
            variant="primary"
            size="sm"
            onClick={() => onNavigate('admin')}
            className="bg-indigo-500 hover:bg-indigo-400 text-white border-0 shadow-md"
            leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
          >
            Launch Admin
          </Button>
        </div>

        {/* 6. Logout & Session Termination */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-md shadow-slate-200/40 dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <LogOut className="w-4 h-4 text-rose-500" />
              Sign Out of FundEcho
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              End your active session on this device. Your saved grants will remain safely stored.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};
