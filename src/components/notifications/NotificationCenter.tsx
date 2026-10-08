import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Clock, 
  FileText, 
  Sparkles, 
  CheckCheck, 
  Trash2, 
  Settings, 
  X, 
  ChevronRight,
  ExternalLink,
  AlertTriangle,
  Info,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { AppNotification, NotificationType, NotificationPreferences } from '../../types/notification';
import { PageId, Opportunity } from '../../types';
import { Button } from '../ui/Button';
import { NotificationPreferencesModal } from './NotificationPreferencesModal';

export interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  notifications: AppNotification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearAll: () => void;
  onNavigate: (page: PageId) => void;
  onSelectOpportunityById?: (opportunityId: string) => void;
  onOpenWorkspaceDraft?: (draftId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  userId,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll,
  onNavigate,
  onSelectOpportunityById,
  onOpenWorkspaceDraft,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'deadlines' | 'drafts' | 'updates'>('all');
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape or outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter notifications based on tab
  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === 'deadlines') {
      return (
        notif.type === 'Deadline Reminder' ||
        notif.type === 'deadline_approaching' ||
        notif.type === 'deadline_update'
      );
    }
    if (activeTab === 'drafts') {
      return (
        notif.type === 'Application Update' ||
        notif.type === 'application_draft_reminder'
      );
    }
    if (activeTab === 'updates') {
      return (
        notif.type === 'Opportunity Update' ||
        notif.type === 'System Notification' ||
        notif.type === 'new_recommendation' ||
        notif.type === 'opportunity_update' ||
        notif.type === 'system'
      );
    }
    return true;
  });

  const getNotificationIcon = (type: NotificationType | string, urgency?: string) => {
    switch (type) {
      case 'Deadline Reminder':
      case 'deadline_approaching':
      case 'deadline_update':
        return urgency === 'urgent' ? (
          <div className="h-8 w-8 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800">
            <AlertTriangle className="w-4 h-4" />
          </div>
        ) : (
          <div className="h-8 w-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
            <Clock className="w-4 h-4" />
          </div>
        );
      case 'Application Update':
      case 'application_draft_reminder':
        return (
          <div className="h-8 w-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
            <FileText className="w-4 h-4" />
          </div>
        );
      case 'Opportunity Update':
      case 'opportunity_update':
        return (
          <div className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
            <Sparkles className="w-4 h-4" />
          </div>
        );
      case 'new_recommendation':
        return (
          <div className="h-8 w-8 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800">
            <Sparkles className="w-4 h-4" />
          </div>
        );
      case 'System Notification':
      case 'system':
      default:
        return (
          <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  const formatTimeAgo = (timestampStr: string) => {
    try {
      const date = new Date(timestampStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    onMarkAsRead(notif.id);

    if (notif.applicationId && onNavigate) {
      onNavigate('application-tracker' as PageId);
      onClose();
      return;
    }

    if (notif.targetWorkspaceDraftId && onOpenWorkspaceDraft) {
      onOpenWorkspaceDraft(notif.targetWorkspaceDraftId);
      onClose();
      return;
    }

    if (notif.opportunityId && onSelectOpportunityById) {
      onSelectOpportunityById(notif.opportunityId);
      onClose();
      return;
    }

    if (notif.targetPage) {
      onNavigate(notif.targetPage as PageId);
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating Dropdown Window */}
      <div
        ref={panelRef}
        className="fixed top-16 right-4 sm:right-8 z-50 w-[calc(100vw-2rem)] sm:w-[460px] max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-150"
        role="dialog"
        aria-label="Notification Center"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Notification Center
                </h2>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Deadline countdowns, proposal drafts & alerts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowPreferencesModal(true)}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Notification Settings"
              aria-label="Notification Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-750'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('deadlines')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'deadlines'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-750'
              }`}
            >
              Deadlines
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('drafts')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'drafts'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-750'
              }`}
            >
              Drafts
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('updates')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'updates'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-750'
              }`}
            >
              Updates
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications Scrollable List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2 space-y-1">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center space-y-3 px-4">
              <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Bell className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No notifications in this view
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                You will receive alerts for approaching deadlines, saved opportunities, and proposal drafts.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isRead = Boolean(notif.read ?? notif.isRead);
              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 rounded-2xl transition-all cursor-pointer group flex items-start gap-3 relative ${
                    isRead
                      ? 'hover:bg-slate-50 dark:hover:bg-slate-800/60 opacity-85'
                      : 'bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/60 border border-indigo-100/80 dark:border-indigo-900/40'
                  }`}
                >
                  {/* Type Icon */}
                  {getNotificationIcon(notif.type, notif.urgency)}

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-bold truncate ${isRead ? 'text-slate-800 dark:text-slate-200' : 'text-slate-900 dark:text-white'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] font-medium text-slate-400 shrink-0">
                        {formatTimeAgo(notif.timestamp || (notif as any).createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>

                    {/* Action Link */}
                    {notif.actionLabel && (
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center gap-1">
                          {notif.actionLabel}
                          <ChevronRight className="w-3 h-3" />
                        </span>

                        {!isRead && (
                          <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNotification(notif.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all"
                    title="Dismiss notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setShowPreferencesModal(true)}
            className="font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Preferences
          </button>

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Preferences Modal */}
      {showPreferencesModal && (
        <NotificationPreferencesModal
          isOpen={showPreferencesModal}
          onClose={() => setShowPreferencesModal(false)}
          userId={userId}
        />
      )}
    </>
  );
};
