import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Trash2,
  Edit3,
  ExternalLink,
  ChevronRight,
  Shield,
  Calendar,
  Building2,
  Sparkles,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Opportunity, PageId } from '../../types';
import { Button } from '../ui/Button';
import { FirestoreApplication, ApplicationTrackerStatus } from '../../types/firebase';
import { 
  subscribeToUserApplications, 
  updateApplicationStatus, 
  updateApplicationNotes,
  deleteApplication
} from '../../services/firebase/applicationService';
import { useAuth } from '../../context/AuthContext';
import { getApplicationDeadlineAwareness } from '../../utils/deadlineUtils';
import { ApplicationDetailsModal } from '../application/ApplicationDetailsModal';

export interface DashboardApplicationsSectionProps {
  allOpportunities: Opportunity[];
  onSelectOpportunity: (opportunity: Opportunity) => void;
  onOpenWorkspace?: (opportunity: Opportunity) => void;
  onNavigate: (page: PageId) => void;
  isCompact?: boolean;
}

const STATUS_COLOR_MAP: Record<ApplicationTrackerStatus, { badge: string; dot: string }> = {
  'Planning': {
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
  'In Progress': {
    badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  'Submitted': {
    badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    dot: 'bg-indigo-500',
  },
  'Under Review': {
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  'Approved': {
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  'Rejected': {
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    dot: 'bg-rose-500',
  },
  'Withdrawn': {
    badge: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
    dot: 'bg-zinc-400',
  },
};

export const DashboardApplicationsSection: React.FC<DashboardApplicationsSectionProps> = ({
  allOpportunities,
  onSelectOpportunity,
  onOpenWorkspace,
  onNavigate,
  isCompact = false,
}) => {
  const { user, firebaseUser } = useAuth();
  const userId = firebaseUser?.uid || user?.id || '';

  const [applications, setApplications] = useState<FirestoreApplication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedAppForModal, setSelectedAppForModal] = useState<FirestoreApplication | null>(null);

  // Subscribe to real-time applications from Firestore
  useEffect(() => {
    if (!userId) {
      setApplications([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeToUserApplications(
      userId,
      (fetchedApps) => {
        setApplications(fetchedApps);
        setIsLoading(false);
        // Keep modal in sync if open
        setSelectedAppForModal((current) => {
          if (!current) return null;
          return fetchedApps.find((a) => a.id === current.id) || null;
        });
      },
      (err) => {
        console.warn('[DashboardApplicationsSection] Subscription error:', err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Format relative updated date
  const formatLastUpdated = (isoString?: string) => {
    if (!isoString) return 'Recently';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 30) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  // Navigates to the original opportunity page using stored opportunityId
  const handleReturnToOpportunity = useCallback((opportunityId: string) => {
    const opp = allOpportunities.find((o) => o.id === opportunityId);
    if (opp) {
      onSelectOpportunity(opp);
      onNavigate('opportunity-detail');
    } else {
      onNavigate('opportunities');
    }
  }, [allOpportunities, onSelectOpportunity, onNavigate]);

  // Updates application status
  const handleStatusChange = async (applicationId: string, newStatus: ApplicationTrackerStatus) => {
    try {
      await updateApplicationStatus(applicationId, newStatus, userId);
    } catch (err) {
      console.error('[DashboardApplicationsSection] Error changing status:', err);
    }
  };

  // Updates application private notes
  const handleNotesChange = async (applicationId: string, notes: string) => {
    try {
      await updateApplicationNotes(applicationId, notes, userId);
    } catch (err) {
      console.error('[DashboardApplicationsSection] Error changing notes:', err);
    }
  };

  // Deletes an application
  const handleDeleteApplication = async (applicationId: string) => {
    try {
      await deleteApplication(applicationId, userId);
      setSelectedAppForModal(null);
    } catch (err) {
      console.error('[DashboardApplicationsSection] Error deleting application:', err);
    }
  };

  const displayApplications = isCompact ? applications.slice(0, 3) : applications;

  return (
    <div
      id="dashboard-applications-tracking-section"
      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-md shadow-slate-200/40 dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] space-y-5"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Application Tracker
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {applications.length} Tracked
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time Firestore tracking for your grant proposals, deadlines, private notes, and submission milestones.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <Button
            id="tracker-find-grants-btn"
            variant="outline"
            size="sm"
            onClick={() => onNavigate('opportunities')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Find Grants to Apply
          </Button>
        </div>
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Loading your applications from Firestore...
          </p>
        </div>
      ) : displayApplications.length === 0 ? (
        /* Empty State: Explains that users can start tracking an opportunity by selecting Start Application */
        <div
          id="applications-empty-state"
          className="text-center py-10 sm:py-12 space-y-4 rounded-2xl bg-slate-50/60 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800 p-6"
        >
          <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-xs">
            <FileText className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              No applications tracked yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Start tracking a funding opportunity by browsing available grants and selecting <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">Start Application</strong> on any opportunity details page.
            </p>
          </div>
          <Button
            id="empty-applications-browse-btn"
            variant="primary"
            size="sm"
            onClick={() => onNavigate('opportunities')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Browse Opportunities
          </Button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {displayApplications.map((app) => {
            const deadlineAwareness = getApplicationDeadlineAwareness(app.deadline);
            const statusConfig = STATUS_COLOR_MAP[app.status] || STATUS_COLOR_MAP['Planning'];

            return (
              <div
                key={app.id}
                id={`application-tracking-card-${app.id}`}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/60 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 group"
              >
                {/* Left Details */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusConfig.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                      {app.status}
                    </span>

                    {/* Deadline Awareness Badge */}
                    <span
                      className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        deadlineAwareness.category === 'Passed'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                          : deadlineAwareness.category === 'Due soon'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                          : deadlineAwareness.category === 'Approaching'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                      }`}
                    >
                      {deadlineAwareness.category} ({deadlineAwareness.formattedDate})
                    </span>

                    <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">&bull;</span>
                    
                    {/* Last Updated */}
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      Updated {formatLastUpdated(app.updatedAt)}
                    </span>

                    {/* Progress / Readiness Bar */}
                    {app.progress !== undefined && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        <span>{app.progress}% Ready</span>
                      </div>
                    )}
                  </div>

                  {/* Opportunity Title (opens details modal) */}
                  <h3
                    onClick={() => setSelectedAppForModal(app)}
                    className="text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer line-clamp-1 leading-snug transition-colors"
                  >
                    {app.opportunityTitle}
                  </h3>

                  {/* Provider & Opportunity Return Link */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {app.provider}
                    </span>

                    <span>&bull;</span>

                    <button
                      type="button"
                      onClick={() => handleReturnToOpportunity(app.opportunityId)}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium inline-flex items-center gap-1"
                    >
                      <span>View Opportunity</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Right Progress / Action Area */}
                <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                  {onOpenWorkspace && (
                    <Button
                      id={`open-workspace-btn-${app.id}`}
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        const opp = allOpportunities.find((o) => o.id === app.opportunityId);
                        if (opp) {
                          onOpenWorkspace(opp);
                        } else {
                          // Fallback synthetic opportunity if not currently in catalog
                          onOpenWorkspace({
                            id: app.opportunityId,
                            title: app.opportunityTitle,
                            provider: app.provider,
                            organization: app.provider,
                            deadline: app.deadline,
                            category: 'Grant',
                            fundingAmount: 'See opportunity',
                            description: 'Application in progress.',
                            eligibility: 'General',
                            verified: true,
                            sourceUrl: '#',
                            createdAt: app.startedAt,
                          } as any);
                        }
                      }}
                      leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                    >
                      Workspace
                    </Button>
                  )}

                  <Button
                    id={`open-app-details-btn-${app.id}`}
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAppForModal(app)}
                    rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  >
                    Details
                  </Button>

                  {/* Quick status cycle button for fast updates */}
                  {app.status === 'Planning' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStatusChange(app.id, 'In Progress')}
                    >
                      Start Drafting
                    </Button>
                  )}
                  {app.status === 'In Progress' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStatusChange(app.id, 'Submitted')}
                    >
                      Mark Submitted
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Application Details Modal */}
      <ApplicationDetailsModal
        isOpen={Boolean(selectedAppForModal)}
        application={selectedAppForModal}
        onClose={() => setSelectedAppForModal(null)}
        onNavigateToOpportunity={handleReturnToOpportunity}
        onStatusChange={handleStatusChange}
        onNotesChange={handleNotesChange}
        onOpenWorkspace={onOpenWorkspace ? (appId, oppId) => {
          const opp = allOpportunities.find((o) => o.id === oppId);
          if (opp) onOpenWorkspace(opp);
        } : undefined}
        onDeleteApplication={handleDeleteApplication}
      />
    </div>
  );
};
