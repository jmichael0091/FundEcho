import React from 'react';
import { 
  ShieldAlert, 
  ArrowLeft, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { PageId, UserProfile } from '../../types';
import { AdminStats } from '../../types/admin';
import { Button } from '../ui/Button';
import { isFirebaseConfigured } from '../../services/firebase/firebaseConfig';

export interface AdminHeaderProps {
  stats: AdminStats;
  currentUser: UserProfile | null;
  onExitAdmin: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  stats,
  currentUser,
  onExitAdmin,
}) => {
  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 shadow-md">
      {/* Top Security & Environment Context Notice */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2 text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <ShieldAlert className="w-3 h-3" />
            ADMIN CONSOLE
          </span>
          <span className="text-slate-400 font-medium">
            Internal Platform & Opportunity Moderation Console
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700/80">
            <span className={`w-2 h-2 rounded-full ${isFirebaseConfigured() ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-slate-300 font-medium">
              {isFirebaseConfigured() ? 'Cloud Database: Connected' : 'Database: Offline Mode'}
            </span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Authorization Active</span>
          </div>
          <span>•</span>
          <span className="text-slate-300 font-semibold">{currentUser?.name || 'Elena Rostova (Admin)'}</span>
        </div>
      </div>

      {/* Main Admin Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-600/30 shrink-0">
            <span className="text-xl tracking-tight">F</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                FundEcho Admin
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Manage opportunities, review pending submissions, update categories, and monitor users.
            </p>
          </div>
        </div>

        {/* Quick Top Stats & Exit Button */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end flex-wrap">
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Published:</span>
              <span className="font-bold text-emerald-400">{stats.activeOpportunities}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">In Review:</span>
              <span className="font-bold text-amber-400">{stats.pendingReviewOpportunities}</span>
            </div>
          </div>

          <Button
            id="admin-exit-portal-btn"
            variant="outline"
            size="sm"
            onClick={onExitAdmin}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            className="border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
          >
            Exit to Seeker Portal
          </Button>
        </div>
      </div>
    </div>
  );
};
