import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  Opportunity, 
  PageId 
} from '../types';
import { calculateProfileCompletion } from '../utils/auth';
import { getRecommendedOpportunities } from '../utils/matching';
import { getAllStoredApplications, deleteApplicationDraft } from '../utils/applicationStorage';
import { getTrackedDeadlines, getTrackedDeadlineForOpportunity } from '../utils/reminderStorage';
import { calculateDeadlineStatus } from '../utils/deadlineUtils';

import { DashboardNav, DashboardTabId } from '../components/dashboard/DashboardNav';
import { DashboardWelcome } from '../components/dashboard/DashboardWelcome';
import { DashboardQuickStats } from '../components/dashboard/DashboardQuickStats';
import { ProfileCompletionBanner } from '../components/dashboard/ProfileCompletionBanner';
import { DashboardRecommendedSection } from '../components/dashboard/DashboardRecommendedSection';
import { DashboardApplicationsSection } from '../components/dashboard/DashboardApplicationsSection';
import { DashboardSavedSection } from '../components/dashboard/DashboardSavedSection';
import { UpcomingDeadlinesSection } from '../components/deadlines/UpcomingDeadlinesSection';
import { DeadlineReminderModal } from '../components/deadlines/DeadlineReminderModal';
import { AffiliateRecommendationSection } from '../components/affiliate/AffiliateRecommendationSection';
import { BillingAndCreditsSection } from '../components/monetization/BillingAndCreditsSection';
import { useMonetization } from '../context/MonetizationContext';
import { subscribeToUserApplications } from '../services/firebase/applicationService';

export interface DashboardPageProps {
  user: UserProfile;
  allOpportunities: Opportunity[];
  bookmarkedIds: Set<string>;
  recentlyViewedIds: string[];
  onNavigate: (page: PageId) => void;
  onSelectOpportunity: (opportunity: Opportunity) => void;
  onToggleBookmark: (opportunity: Opportunity) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  allOpportunities,
  bookmarkedIds,
  recentlyViewedIds,
  onNavigate,
  onSelectOpportunity,
  onToggleBookmark,
}) => {
  const { isPremium } = useMonetization();
  const [activeTab, setActiveTab] = useState<DashboardTabId>('overview');
  const [reminderModalOpp, setReminderModalOpp] = useState<Opportunity | null>(null);
  const [storedDrafts, setStoredDrafts] = useState(() => getAllStoredApplications(user?.id));
  const [trackedDeadlines, setTrackedDeadlines] = useState(() => getTrackedDeadlines(user?.id));
  const [trackedApplicationsCount, setTrackedApplicationsCount] = useState<number>(0);

  // Subscribe to real-time tracked applications from Firestore
  useEffect(() => {
    if (!user?.id) {
      setTrackedApplicationsCount(0);
      return;
    }
    const unsub = subscribeToUserApplications(
      user.id,
      (apps) => {
        setTrackedApplicationsCount(apps.length);
      },
      (err) => console.warn('[DashboardPage] Applications count sub error:', err)
    );
    return () => unsub();
  }, [user?.id]);

  // Reload drafts and tracked deadlines when user or tabs change
  useEffect(() => {
    setStoredDrafts(getAllStoredApplications(user?.id));
    setTrackedDeadlines(getTrackedDeadlines(user?.id));
  }, [user?.id, activeTab]);

  // Saved opportunities list
  const savedOpportunities = allOpportunities.filter((opp) => bookmarkedIds.has(opp.id));

  // Profile completion calculation
  const completionPercentage = calculateProfileCompletion(user);

  // Recommendations calculated via Step 6 matching engine
  const allRecommendations = getRecommendedOpportunities(user, allOpportunities);

  // Active / urgent deadlines count
  const urgentDeadlinesCount = allOpportunities.filter((opp) => {
    const isSaved = bookmarkedIds.has(opp.id);
    const isTracked = trackedDeadlines.some((t) => t.opportunityId === opp.id);
    if (!isSaved && !isTracked) return false;
    const status = calculateDeadlineStatus(opp.deadline);
    return status.hasDeadline && !status.isPast && status.daysRemaining <= 30;
  }).length;

  const handleOpenWorkspace = (opp: Opportunity) => {
    onSelectOpportunity(opp);
    onNavigate('application-workspace');
  };

  const handleDraftDeleted = (draftId: string) => {
    setStoredDrafts((prev) => prev.filter((d) => d.id !== draftId));
  };

  const handleTrackedDeadlinesChanged = () => {
    setTrackedDeadlines(getTrackedDeadlines(user?.id));
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 overflow-x-clip">
      {/* 1. TOP WELCOME GREETING SECTION */}
      <DashboardWelcome
        user={user}
        completionPercentage={completionPercentage}
        onNavigate={onNavigate}
      />

      {/* 2. PROFILE COMPLETION BANNER (when incomplete) */}
      <ProfileCompletionBanner
        completionPercentage={completionPercentage}
        onNavigate={onNavigate}
      />

      {/* 3. QUICK STATS SUMMARY CARDS */}
      <DashboardQuickStats
        savedCount={savedOpportunities.length}
        recommendedCount={allRecommendations.length}
        urgentDeadlinesCount={urgentDeadlinesCount}
        applicationsInProgressCount={trackedApplicationsCount || storedDrafts.length}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* 4. MAIN DASHBOARD CONTENT WITH DESKTOP SIDEBAR / MOBILE NAV */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 items-start">
        {/* LEFT COLUMN: NAVIGATION HUB */}
        <div className="lg:col-span-1">
          <DashboardNav
            activeTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
            onNavigate={onNavigate}
            counts={{
              recommended: allRecommendations.length,
              saved: savedOpportunities.length,
              deadlines: urgentDeadlinesCount,
              applications: trackedApplicationsCount || storedDrafts.length,
            }}
          />
        </div>

        {/* RIGHT 3 COLUMNS: TAB-DRIVEN CONTENT PANELS */}
        <div className="lg:col-span-3 space-y-6 sm:space-y-8 min-w-0">
          {/* TAB 1: OVERVIEW (ALL MAIN SECTIONS CURATED TOGETHER) */}
          {activeTab === 'overview' && (
            <div className="space-y-6 sm:space-y-8">
              {/* 1. Recommended Opportunities (Compact Top Matches) */}
              <DashboardRecommendedSection
                recommendedItems={allRecommendations}
                bookmarkedIds={bookmarkedIds}
                onSelectOpportunity={onSelectOpportunity}
                onToggleBookmark={onToggleBookmark}
                onNavigate={onNavigate}
                isCompact={true}
              />

              {/* 2. Upcoming Deadlines Section */}
              <UpcomingDeadlinesSection
                allOpportunities={allOpportunities}
                trackedDeadlines={trackedDeadlines}
                savedOpportunityIds={bookmarkedIds}
                onSelectOpportunity={onSelectOpportunity}
                onNavigate={onNavigate}
                onStartApplication={handleOpenWorkspace}
                onTrackedDeadlinesChanged={handleTrackedDeadlinesChanged}
              />

              {/* 3. Applications in Progress Section */}
              <DashboardApplicationsSection
                allOpportunities={allOpportunities}
                onSelectOpportunity={onSelectOpportunity}
                onOpenWorkspace={handleOpenWorkspace}
                onNavigate={onNavigate}
                isCompact={true}
              />

              {/* 4. Saved Opportunities Snapshot */}
              <DashboardSavedSection
                savedOpportunities={savedOpportunities}
                onSelectOpportunity={onSelectOpportunity}
                onToggleBookmark={onToggleBookmark}
                onNavigate={onNavigate}
                isCompact={true}
              />

              {/* 5. Personalized Tools & Resources (Step 16) */}
              <div className="pt-2">
                <AffiliateRecommendationSection
                  context={{
                    userId: user?.id,
                    country: user?.country,
                    userType: user?.applicantType,
                    interests: user?.interests,
                    fundingPreferences: user?.preferredFundingTypes,
                    isPremium: isPremium
                  }}
                  placement="dashboard_overview"
                  title="Recommended Tools for Your Profile"
                  subtitle="Curated partner software, grant proposal tools, and financial resources matched to your funding pursuits."
                  initialLimit={3}
                  maxResults={6}
                />
              </div>
            </div>
          )}

          {/* TAB 2: RECOMMENDED ONLY */}
          {activeTab === 'recommended' && (
            <div className="space-y-10">
              <DashboardRecommendedSection
                recommendedItems={allRecommendations}
                bookmarkedIds={bookmarkedIds}
                onSelectOpportunity={onSelectOpportunity}
                onToggleBookmark={onToggleBookmark}
                onNavigate={onNavigate}
                isCompact={false}
              />

              <AffiliateRecommendationSection
                context={{
                  userId: user?.id,
                  country: user?.country,
                  userType: user?.applicantType,
                  interests: user?.interests,
                  fundingPreferences: user?.preferredFundingTypes,
                  isPremium: isPremium
                }}
                placement="recommended_opportunities"
                title="Recommended Partner Resources"
                subtitle="High-match software and services to strengthen your application readiness."
                initialLimit={3}
                maxResults={6}
              />
            </div>
          )}

          {/* TAB 3: SAVED ONLY */}
          {activeTab === 'saved' && (
            <DashboardSavedSection
              savedOpportunities={savedOpportunities}
              onSelectOpportunity={onSelectOpportunity}
              onToggleBookmark={onToggleBookmark}
              onNavigate={onNavigate}
              isCompact={false}
            />
          )}

          {/* TAB 4: DEADLINES ONLY */}
          {activeTab === 'deadlines' && (
            <UpcomingDeadlinesSection
              allOpportunities={allOpportunities}
              trackedDeadlines={trackedDeadlines}
              savedOpportunityIds={bookmarkedIds}
              onSelectOpportunity={onSelectOpportunity}
              onNavigate={onNavigate}
              onStartApplication={handleOpenWorkspace}
              onTrackedDeadlinesChanged={handleTrackedDeadlinesChanged}
            />
          )}

          {/* TAB 5: APPLICATIONS ONLY */}
          {activeTab === 'applications' && (
            <DashboardApplicationsSection
              allOpportunities={allOpportunities}
              onSelectOpportunity={onSelectOpportunity}
              onOpenWorkspace={handleOpenWorkspace}
              onNavigate={onNavigate}
              isCompact={false}
            />
          )}

          {/* TAB 6: BILLING & CREDITS (STEP 17) */}
          {activeTab === 'billing' && (
            <BillingAndCreditsSection
              user={user}
              onNavigate={onNavigate}
            />
          )}
        </div>
      </div>

      {/* DEADLINE REMINDER CONFIGURATION MODAL */}
      <DeadlineReminderModal
        isOpen={Boolean(reminderModalOpp)}
        onClose={() => setReminderModalOpp(null)}
        opportunity={reminderModalOpp}
        onReminderSaved={() => {
          setReminderModalOpp(null);
          handleTrackedDeadlinesChanged();
        }}
      />
    </div>
  );
};
