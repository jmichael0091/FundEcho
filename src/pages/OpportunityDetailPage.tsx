import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  Bookmark, 
  Share2, 
  ShieldCheck, 
  AlertCircle,
  FileText,
  DollarSign,
  Calendar,
  Sparkles,
  Award,
  Info,
  ChevronRight,
  Globe,
  Layers,
  Check,
  CalendarCheck,
  Send,
  HelpCircle,
  FileCheck2,
  CheckSquare,
  Bell,
  Search,
  Tag,
  CalendarPlus,
  Download
} from 'lucide-react';
import { Opportunity, PageId, Category, EligibilityAssessmentResult } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { OpportunityCard } from '../components/ui/OpportunityCard';
import { getRelatedOpportunities } from '../utils/relatedOpportunities';
import { getCurrentUser } from '../utils/auth';
import { calculateOpportunityMatch } from '../utils/matching';
import { EligibilityCheckerModal } from '../components/eligibility/EligibilityCheckerModal';
import { EligibilityStatusCard } from '../components/eligibility/EligibilityStatusCard';
import { getSavedEligibilityAssessment } from '../utils/eligibilityEngine';
import { DeadlineBadge } from '../components/deadlines/DeadlineBadge';
import { DeadlineReminderModal } from '../components/deadlines/DeadlineReminderModal';
import { AdSenseSlot } from '../components/monetization/AdSenseSlot';
import { useMonetization } from '../context/MonetizationContext';
import { getTrackedDeadlineForOpportunity, isOpportunityTracked } from '../utils/reminderStorage';
import { calculateDeadlineStatus, formatDeadlineDate } from '../utils/deadlineUtils';
import { SEOHead } from '../components/seo/SEOHead';
import { SEOInspectorModal } from '../components/seo/SEOInspectorModal';
import { MilestonePlannerModal } from '../components/deadlines/MilestonePlannerModal';
import { getFunderByOrganizationName } from '../data/funderDirectoryData';
import { generateGoogleCalendarUrl, generateICSContent, downloadICSFile, generateMilestonePlan } from '../utils/calendarExportUtils';
import { 
  generateOpportunityJSONLD, 
  getSiteOrigin, 
  slugify, 
  getFundingTypeSlug,
  getCountrySlugFromLocation,
  CATEGORIES_SEO_MAP
} from '../utils/seoUtils';
import { SEOMetaData } from '../types/seo';
import { AffiliateRecommendationSection } from '../components/affiliate/AffiliateRecommendationSection';
import { AffiliateUserContext } from '../types/affiliate';
import { useAuth } from '../context/AuthContext';
import { 
  startApplication, 
  getUserApplicationForOpportunity,
  updateApplicationStatus,
  updateApplicationNotes,
  deleteApplication
} from '../services/firebase/applicationService';
import { FirestoreApplication, ApplicationTrackerStatus } from '../types/firebase';
import { ApplicationDetailsModal } from '../components/application/ApplicationDetailsModal';

export interface OpportunityDetailPageProps {
  opportunity: Opportunity;
  allOpportunities: Opportunity[];
  allCategories?: Category[];
  onNavigate: (page: PageId) => void;
  onSelectOpportunity: (opportunity: Opportunity) => void;
  onSelectCategory?: (categorySlug: string) => void;
  onSelectCountry?: (countrySlug: string) => void;
  onSelectFundingType?: (typeSlug: string) => void;
  onSelectFunder?: (funderSlug: string) => void;
  isBookmarked: boolean;
  onToggleBookmark: (opportunity: Opportunity) => void;
  onBackToDirectory?: () => void;
}

export const OpportunityDetailPage: React.FC<OpportunityDetailPageProps> = ({
  opportunity,
  allOpportunities,
  allCategories = [],
  onNavigate,
  onSelectOpportunity,
  onSelectCategory,
  onSelectCountry,
  onSelectFundingType,
  onSelectFunder,
  isBookmarked,
  onToggleBookmark,
  onBackToDirectory,
}) => {
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isSEOInspectorOpen, setIsSEOInspectorOpen] = useState(false);
  const [eligibilityAssessment, setEligibilityAssessment] = useState<EligibilityAssessmentResult | null>(null);
  const [trackedDeadlineInfo, setTrackedDeadlineInfo] = useState(() => getTrackedDeadlineForOpportunity(opportunity.id));
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);

  // STEP 22: APPLICATION TRACKING SYSTEM
  const { user: authUser, firebaseUser, isLoggedIn } = useAuth();
  const userId = firebaseUser?.uid || authUser?.id || '';
  const [existingApplication, setExistingApplication] = useState<FirestoreApplication | null>(null);
  const [isStartingApplication, setIsStartingApplication] = useState(false);
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!userId || !opportunity?.id) {
      setExistingApplication(null);
      return;
    }
    getUserApplicationForOpportunity(userId, opportunity.id)
      .then((app) => {
        if (isMounted) setExistingApplication(app);
      })
      .catch((err) => {
        console.warn('[OpportunityDetailPage] Error checking existing application:', err);
      });
    return () => {
      isMounted = false;
    };
  }, [userId, opportunity?.id]);

  const handleStartApplication = async () => {
    // 12. Public vs Authenticated Experience
    // If a logged-out user selects Start Application, send them through the existing login/registration flow.
    if (!isLoggedIn || !userId) {
      onNavigate('login');
      return;
    }

    // 13. Duplicate Protection
    // If the user has already started an application for that opportunity, do not create a duplicate application.
    // Instead, take the user to their existing application tracker.
    if (existingApplication) {
      setIsTrackerModalOpen(true);
      return;
    }

    setIsStartingApplication(true);
    try {
      const result = await startApplication(userId, {
        id: opportunity.id,
        title: opportunity.title,
        provider: opportunity.organization,
        deadline: opportunity.deadline,
      });
      setExistingApplication(result.application);
      setIsTrackerModalOpen(true);
    } catch (err) {
      console.error('[OpportunityDetailPage] Failed to start application:', err);
    } finally {
      setIsStartingApplication(false);
    }
  };

  const verifiedFunder = useMemo(() => getFunderByOrganizationName(opportunity.organization), [opportunity.organization]);

  const origin = getSiteOrigin();
  const canonicalUrl = `${origin}/opportunities/${opportunity.slug}`;

  // SEO Title & Description
  const seoTitle = `${opportunity.title} — ${opportunity.organization} | FundEcho`;
  const seoDescription = `${opportunity.summary} Apply before ${opportunity.deadline}. Open for applicants in ${opportunity.location}.`;

  const categorySlug = slugify(opportunity.category);
  const countrySlug = getCountrySlugFromLocation(opportunity.location);
  const fundingTypeSlug = getFundingTypeSlug(opportunity.type);

  const seoMetadata: SEOMetaData = {
    title: seoTitle,
    description: seoDescription,
    canonicalUrl: canonicalUrl,
    ogTitle: seoTitle,
    ogDescription: seoDescription,
    ogType: 'article',
    robots: 'index, follow',
    keywords: [
      opportunity.title,
      opportunity.organization,
      opportunity.category,
      opportunity.type,
      opportunity.location,
      'funding opportunity',
      'verified grant'
    ],
    breadcrumbs: [
      { name: 'Home', url: `${origin}/` },
      { name: 'Opportunities', url: `${origin}/opportunities` },
      { name: opportunity.title, url: canonicalUrl }
    ],
    jsonLdSchema: generateOpportunityJSONLD(opportunity, origin)
  };

  // Scroll to top and load saved eligibility assessment when opportunity changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const saved = getSavedEligibilityAssessment(opportunity.id);
    setEligibilityAssessment(saved);
    setTrackedDeadlineInfo(getTrackedDeadlineForOpportunity(opportunity.id));
  }, [opportunity.id]);

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2500);
      }
    } catch {
      // Fallback
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    }
  };

  const handleBack = () => {
    if (onBackToDirectory) {
      onBackToDirectory();
    } else {
      onNavigate('opportunities');
    }
  };

  // Helper values & defaults for information richness
  const status = opportunity.status || (opportunity.daysLeft <= 15 ? 'Closing Soon' : 'Open');
  const lastUpdated = opportunity.lastUpdated || opportunity.datePosted;

  const requiredDocuments = opportunity.requiredDocuments || [
    'Complete online application form and executive narrative',
    'Curriculum Vitae (CV) / Team biographies and portfolio evidence',
    'Itemized project budget breakdown and expenditure justification',
    'Institutional endorsement, legal registration, or letters of recommendation'
  ];

  const applicationProcess = opportunity.applicationProcess || [
    'Review eligibility criteria, required documentation, and review guidelines.',
    'Prepare your proposal narrative, team credentials, and itemized financial plan.',
    'Access the provider\'s official application portal via the external link below.',
    'Submit the complete application package prior to the final deadline closing.',
    'Notification of shortlisted candidates and peer-review evaluation round.'
  ];

  const importantDates = opportunity.importantDates || [
    {
      label: 'Applications Opened',
      date: opportunity.datePosted,
      description: 'Official call for submissions published by provider.',
      isPassed: true
    },
    {
      label: 'Application Deadline',
      date: opportunity.deadline,
      description: `Final closing at 23:59 UTC (${opportunity.daysLeft} days remaining).`,
      isPassed: false
    },
    {
      label: 'Review & Selection Period',
      date: 'Within 4–6 weeks of deadline',
      description: 'Committee peer review and technical due diligence.',
      isPassed: false
    },
    {
      label: 'Official Award Announcement',
      date: 'Post evaluation completion',
      description: 'Selected candidates notified and grant agreements signed.',
      isPassed: false
    }
  ];

  // Related opportunities
  const relatedOpportunities = getRelatedOpportunities(opportunity, allOpportunities, 3);

  const getTypeBadgeVariant = (type: Opportunity['type']) => {
    switch (type) {
      case 'Grant': return 'indigo';
      case 'Scholarship': return 'sky';
      case 'Fellowship': return 'purple';
      case 'Competition': return 'amber';
      case 'NGO & Non-Profit': return 'emerald';
      case 'Business Funding': return 'indigo';
      case 'Research Grant': return 'teal';
      default: return 'slate';
    }
  };

  const user = authUser || getCurrentUser();
  const match = calculateOpportunityMatch(user, opportunity);
  const { isPremium } = useMonetization();

  const affiliateContext: AffiliateUserContext = useMemo(() => {
    return {
      userId: user?.id,
      country: user?.country || (opportunity.location ? opportunity.location.split(',')[0].trim() : undefined),
      userType: user?.applicantType,
      interests: user?.interests,
      fundingType: opportunity.type,
      opportunityCategory: opportunity.category,
      currentOpportunity: opportunity,
      isPremium: isPremium
    };
  }, [user, opportunity, isPremium]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 overflow-x-clip">
      {/* 0. SEO HEAD TAGS */}
      <SEOHead metadata={seoMetadata} />

      {/* 1. BREADCRUMB & BACK NAVIGATION */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
          >
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button
            type="button"
            onClick={handleBack}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
          >
            Opportunities
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 dark:text-white font-semibold truncate max-w-[200px] sm:max-w-xs">
            {opportunity.title}
          </span>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="seo-inspector-trigger-btn"
            onClick={() => setIsSEOInspectorOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Search className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>SEO & Schema Inspector</span>
          </button>

          <button
            type="button"
            id="back-to-directory-btn"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Opportunities</span>
          </button>
        </div>
      </div>

      {/* INTERNAL SEO DISCOVERABILITY HUBS BAR */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold">
          <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>Discover Related Directories:</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onSelectCategory && (
            <button
              type="button"
              onClick={() => onSelectCategory(categorySlug)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-slate-200 dark:border-slate-700 font-medium transition-colors"
            >
              <Layers className="w-3 h-3" />
              <span>More in {opportunity.category}</span>
            </button>
          )}

          {onSelectFundingType && (
            <button
              type="button"
              onClick={() => onSelectFundingType(fundingTypeSlug)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-slate-200 dark:border-slate-700 font-medium transition-colors"
            >
              <Award className="w-3 h-3" />
              <span>All {opportunity.type} Programs</span>
            </button>
          )}

          {onSelectCountry && (
            <button
              type="button"
              onClick={() => onSelectCountry(countrySlug)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-slate-200 dark:border-slate-700 font-medium transition-colors"
            >
              <MapPin className="w-3 h-3" />
              <span>Grants in {opportunity.location}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. OPPORTUNITY HEADER & CORE META */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 lg:p-10 shadow-lg shadow-slate-200/50 dark:shadow-[0_20px_35px_-5px_rgba(0,0,0,0.4)] space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            {/* Badges Bar */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <Badge variant={getTypeBadgeVariant(opportunity.type)} size="md">
                {opportunity.type}
              </Badge>
              <Badge variant="slate" size="md">
                {opportunity.category}
              </Badge>
              
              {/* Application Status Badge */}
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
                status === 'Open' 
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              }`}>
                <span className={`h-2 w-2 rounded-full ${status === 'Open' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                {status}
              </span>

              {opportunity.verified && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200/80 dark:border-emerald-800/80">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Verified Provider
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
              {opportunity.title}
            </h1>

            {/* Organization & Location Meta */}
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 flex-wrap">
              <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                <span className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-2xs ${opportunity.orgLogoBg || 'bg-slate-800'}`}>
                  {opportunity.orgInitials || 'OR'}
                </span>
                <span className="text-base font-semibold">{opportunity.organization}</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                <span>{opportunity.location} ({opportunity.region})</span>
              </div>
            </div>

            {/* Short Summary Lead */}
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl pt-1">
              {opportunity.summary}
            </p>
          </div>

          {/* Quick Header Actions: Start Application, Check Eligibility, Save & Share */}
          <div className="flex items-center gap-2.5 shrink-0 self-start flex-wrap">
            <button
              type="button"
              id="header-start-application-btn"
              onClick={handleStartApplication}
              disabled={isStartingApplication}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-98 disabled:opacity-75"
            >
              {existingApplication ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Tracked ({existingApplication.status})</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>{isStartingApplication ? 'Starting...' : 'Start Application'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="header-track-deadline-btn"
              onClick={() => setIsReminderModalOpen(true)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all shadow-2xs ${
                trackedDeadlineInfo
                  ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 ring-2 ring-amber-500/20'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
              title={trackedDeadlineInfo ? 'Manage deadline reminder' : 'Track deadline & set reminders'}
            >
              <Bell className={`w-4 h-4 ${trackedDeadlineInfo ? 'fill-amber-500 text-amber-600 dark:text-amber-400' : 'text-slate-400'}`} />
              <span>{trackedDeadlineInfo ? 'Reminders Set' : 'Track Deadline'}</span>
            </button>

            <button
              type="button"
              id="header-check-eligibility-btn"
              onClick={() => setIsEligibilityModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-xs sm:text-sm font-bold transition-all shadow-2xs"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{eligibilityAssessment ? 'Eligibility Result' : 'Check Eligibility'}</span>
            </button>

            <button
              type="button"
              id="detail-save-btn"
              onClick={() => onToggleBookmark(opportunity)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all shadow-2xs ${
                isBookmarked
                  ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
              title={isBookmarked ? 'Remove from saved' : 'Save opportunity'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-indigo-600 dark:fill-indigo-400 text-indigo-600 dark:text-indigo-400' : ''}`} />
              <span>{isBookmarked ? 'Saved to Bookmarks' : 'Save Opportunity'}</span>
            </button>

            <button
              type="button"
              id="detail-share-btn"
              onClick={handleShare}
              className="relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs sm:text-sm font-semibold transition-all shadow-2xs"
              title="Share link"
            >
              {copyFeedback ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-slate-500" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. KEY INFORMATION SUMMARY (Highlight Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 sm:p-6 bg-slate-50/90 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-md shadow-slate-200/40 dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)]">
          {/* Award Amount */}
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Funding Value
            </span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {opportunity.amount.displayText}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {opportunity.amount.isFullyFunded ? 'Full coverage & living stipend' : 'Direct non-dilutive award'}
            </p>
          </div>

          {/* Deadline */}
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Application Deadline
            </span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {opportunity.deadline}
            </p>
            <div className="pt-0.5">
              <DeadlineBadge deadline={opportunity.deadline} size="xs" />
            </div>
          </div>

          {/* Eligible Geography */}
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Eligible Regions
            </span>
            <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
              {opportunity.region}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {opportunity.location}
            </p>
          </div>

          {/* Trust / Verified Status */}
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Source & Verification
            </span>
            <p className="text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-400">
              {opportunity.verified ? 'Verified Active' : 'Community Listed'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT 2-COLUMN LAYOUT: DETAILED SECTIONS + STICKY SIDEBAR CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT 2 COLUMNS: DETAILED SECTIONS */}
        <div className="lg:col-span-2 space-y-8">
          {/* VERIFIED INSTITUTIONAL FUNDER PROFILE CARD */}
          {verifiedFunder && (
            <section className="bg-white dark:bg-slate-900 rounded-3xl border border-indigo-100 dark:border-indigo-900/60 p-6 sm:p-7 shadow-sm space-y-4 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <span className={`h-12 w-12 rounded-2xl flex items-center justify-center text-base font-black text-white shadow-xs ${verifiedFunder.logoBg} shrink-0`}>
                    {verifiedFunder.initials}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Verified Institutional Funder
                      </span>
                      <span className="p-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                      {verifiedFunder.name}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onSelectFunder) {
                      onSelectFunder(verifiedFunder.slug);
                    } else {
                      onNavigate('funders');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors self-start sm:self-auto"
                >
                  <span>Funder Intelligence Profile</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {verifiedFunder.mission}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Typical Award</span>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400 truncate">{verifiedFunder.typicalGrantRange}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Unsolicited Policy</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{verifiedFunder.unsolicitedPolicy}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Review Cycle</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{verifiedFunder.reviewCycle}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Turnaround</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{verifiedFunder.averageTurnaroundTime}</p>
                </div>
              </div>
            </section>
          )}

          {/* 4. OVERVIEW */}
          <section id="section-overview" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-md shadow-slate-200/40 dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Opportunity Overview & Scope
            </h2>
            <div className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed space-y-3">
              <p>{opportunity.description}</p>
            </div>

            {/* Target Audience Highlight Box */}
            <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/50 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 text-xs sm:text-sm text-indigo-950 dark:text-indigo-200">
              <strong className="font-bold text-indigo-900 dark:text-indigo-300">Target Audience / Profile: </strong>
              <span>{opportunity.targetAudience}</span>
            </div>

            {/* Award & Financial Benefits Breakdown */}
            <div className="pt-3 space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Award Details & Benefit Structure
              </h3>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {opportunity.awardDetails}
              </div>
            </div>
          </section>

          {/* 5. ELIGIBILITY REQUIREMENTS */}
          <section id="section-eligibility" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-md shadow-slate-200/40 dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Eligibility Criteria & Verification
              </h2>
              <button
                type="button"
                onClick={() => setIsEligibilityModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors shadow-2xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{eligibilityAssessment ? 'View Assessment' : 'Run Eligibility Check'}</span>
              </button>
            </div>

            {/* Interactive Step 7 Status Card */}
            <EligibilityStatusCard
              opportunity={opportunity}
              assessment={eligibilityAssessment}
              onOpenChecker={() => setIsEligibilityModalOpen(true)}
              onNavigate={onNavigate}
              variant="inline"
            />

            <div className="space-y-3 pt-2">
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Applicants must satisfy all stated criteria below prior to submitting an official application:
              </p>
              <ul className="space-y-3">
                {opportunity.eligibility.map((criterion, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-slate-700 dark:text-slate-300">
                    <span className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-emerald-200 dark:border-emerald-800">
                      ✓
                    </span>
                    <span>{criterion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 6. REQUIREMENTS & REQUIRED DOCUMENTS */}
          <section id="section-requirements" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-md shadow-slate-200/40 dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                <FileCheck2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                Required Documents & Submissions
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
                Have the following materials finalized and ready before starting the external application:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {requiredDocuments.map((doc, idx) => (
                <div 
                  key={idx} 
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-3"
                >
                  <span className="font-black text-indigo-600 dark:text-indigo-400 text-xs bg-indigo-50 dark:bg-indigo-950 px-2 py-1 rounded-md border border-indigo-200 dark:border-indigo-800 shrink-0">
                    DOC {idx + 1}
                  </span>
                  <span className="leading-snug">{doc}</span>
                </div>
              ))}
            </div>

            {/* Additional requirements list if present */}
            {opportunity.requirements.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Specific Proposal Guidelines:
                </h3>
                <ul className="space-y-2">
                  {opportunity.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* 7. APPLICATION PROCESS */}
          <section id="section-process" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-md shadow-slate-200/40 dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Send className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Step-by-Step Application Process
            </h2>
            <div className="space-y-3 pt-1">
              {applicationProcess.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="h-7 w-7 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                    {idx + 1}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-0.5">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 8. IMPORTANT DATES TIMELINE */}
          <section id="section-dates" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-md shadow-slate-200/40 dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <CalendarCheck className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              Important Timeline & Deadlines
            </h2>
            <div className="space-y-4 pt-1">
              {importantDates.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    item.label === 'Application Deadline'
                      ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/70'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.label}
                      </span>
                      {item.isPassed && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          Passed
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 font-extrabold text-sm sm:text-base text-indigo-600 dark:text-indigo-400">
                    {item.date}
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Milestone Planner CTA */}
            <div className="mt-4 p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Structured Milestone Preparation Timeline (T-30 to T-0)
                </span>
                <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80">
                  Track document collation, referee recommendations, internal draft reviews, and final sign-offs.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsMilestoneModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs transition-colors shrink-0"
              >
                Plan Milestones
              </button>
            </div>
          </section>

          {/* Tags & Classifications */}
          <div className="pt-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
              Tags & Field Classifications:
            </span>
            <div className="flex flex-wrap gap-2">
              {opportunity.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-3 py-1 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700 shadow-2xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT 1 COLUMN: STICKY APPLICATION CTA & TRUST WIDGET */}
        <div className="space-y-6 lg:sticky lg:top-24">
          {/* Smart Match Score Box */}
          {user ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-md shadow-slate-200/40 dark:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.4)] space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Your Profile Match
                </span>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                  match.matchScore >= 90
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : match.matchScore >= 75
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                    : match.matchScore >= 60
                    ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}>
                  {match.matchScore}% {match.eligibilityStatus}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    match.matchScore >= 90
                      ? 'bg-emerald-500'
                      : match.matchScore >= 75
                      ? 'bg-indigo-600'
                      : match.matchScore >= 60
                      ? 'bg-amber-500'
                      : 'bg-slate-400'
                  }`}
                  style={{ width: `${match.matchScore}%` }}
                />
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {match.reasons.join(" ")}
              </p>

              {match.matchedCriteria.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {match.matchedCriteria.map((tag, idx) => (
                    <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-[10px] text-slate-400 dark:text-slate-500 italic pt-1 border-t border-slate-100 dark:border-slate-800">
                Match score indicates relevance, not eligibility or approval.
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Check Your Profile Match</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sign in to see how closely this opportunity aligns with your location, interests, and funding goals.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                Sign In &rarr;
              </button>
            </div>
          )}

          {/* Main Action Box */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xl shadow-slate-200/60 dark:shadow-[0_20px_35px_-5px_rgba(0,0,0,0.5)] space-y-5">
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                Direct Provider Application
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Ready to Apply?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You will be redirected to the provider's verified portal to submit your documents.
              </p>
            </div>

            {/* Step 7 Quick Eligibility Action */}
            <button
              type="button"
              id="sidebar-eligibility-btn"
              onClick={() => setIsEligibilityModalOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs sm:text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors shadow-2xs"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{eligibilityAssessment ? 'Review Eligibility Assessment' : 'Check Eligibility (Takes 1 min)'}</span>
            </button>

            {/* Step 8 Workspace Action: Primary preparation CTA */}
            <button
              type="button"
              id="sidebar-start-application-btn"
              onClick={handleStartApplication}
              disabled={isStartingApplication}
              className="w-full inline-flex items-center justify-center font-bold transition-all select-none rounded-2xl py-3.5 px-6 text-base bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-lg shadow-indigo-600/25 border border-indigo-600 dark:border-indigo-500 gap-2 active:scale-98 disabled:opacity-75"
            >
              {existingApplication ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  <span>View in Tracker ({existingApplication.status})</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>{isStartingApplication ? 'Starting Application...' : 'Start Application'}</span>
                </>
              )}
            </button>

            {/* Step 9: Track Deadline & Set Reminders */}
            <button
              type="button"
              id="sidebar-track-deadline-btn"
              onClick={() => setIsReminderModalOpen(true)}
              className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-xs sm:text-sm transition-colors shadow-2xs ${
                trackedDeadlineInfo
                  ? 'border-amber-300 dark:border-amber-700 bg-amber-50/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              <Bell className={`w-4 h-4 ${trackedDeadlineInfo ? 'fill-amber-500 text-amber-600 dark:text-amber-400' : 'text-slate-400'}`} />
              <span>{trackedDeadlineInfo ? 'Reminders Active (Edit)' : 'Set Deadline Reminder'}</span>
            </button>

            {/* Calendar & Milestone Sync */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Calendar & Timeline Sync:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={generateGoogleCalendarUrl(opportunity)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors shadow-2xs"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>Google Cal</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const ics = generateICSContent([opportunity]);
                    downloadICSFile(`FundEcho_${opportunity.slug || opportunity.id}.ics`, ics);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>iCal (.ics)</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsMilestoneModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors shadow-2xs"
              >
                <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Milestone Plan (T-30 to T-0)</span>
              </button>
            </div>

            {/* Direct Official External Link */}
            <a
              id="official-apply-cta-btn"
              href={opportunity.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center font-bold transition-all select-none rounded-2xl py-3 px-6 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 gap-2 active:scale-98"
            >
              <span>Apply on Official Website</span>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </a>

            {/* Trust & Transparency Note */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>100% Free:</strong> FundEcho does not process applications or charge fees. All applications are submitted directly to the host organization.
                </span>
              </div>
            </div>

            {/* Quick Metadata Box */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Application Fee:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">None (Free to apply)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Portal Security:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">SSL Encrypted / Official</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Provider:</span>
                <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[140px]">
                  {opportunity.organization}
                </span>
              </div>
            </div>
          </div>

          {/* Secondary Assistance & Help Card */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 text-xs text-slate-600 dark:text-slate-300 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Need help preparing?</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Ensure you review all required documentation and grant guidelines before submitting on the host portal.
            </p>
          </div>

          {/* Non-intrusive Sidebar Ad Placement (hidden for Premium subscribers) */}
          <AdSenseSlot
            slotId="ad-slot-opp-detail-sidebar"
            format="rectangle"
            className="w-full mt-4"
          />
        </div>
      </div>

      {/* 9. APPLICATION CTA (Full Width Responsive Banner for Easy Access) */}
      <div className="bg-indigo-600 dark:bg-indigo-950 rounded-3xl p-6 sm:p-8 text-white border border-indigo-500 dark:border-indigo-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-xl sm:text-2xl font-bold">
            Apply before {opportunity.deadline}
          </h3>
          <p className="text-indigo-100 text-xs sm:text-sm">
            {opportunity.daysLeft} days remaining • Direct application via {opportunity.organization}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          <button
            type="button"
            id="bottom-start-workspace-btn"
            onClick={handleStartApplication}
            disabled={isStartingApplication}
            className="w-full sm:w-auto inline-flex items-center justify-center font-bold transition-all select-none rounded-xl py-3 px-5 text-sm sm:text-base bg-white text-indigo-700 hover:bg-indigo-50 shadow-md gap-2 shrink-0 disabled:opacity-75"
          >
            {existingApplication ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Tracked ({existingApplication.status})</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>{isStartingApplication ? 'Starting...' : 'Start Application'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsEligibilityModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center font-bold transition-all select-none rounded-xl py-3 px-5 text-sm sm:text-base bg-indigo-700 hover:bg-indigo-800 text-white border border-indigo-400/40 shadow-md gap-2 shrink-0"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Check Eligibility</span>
          </button>
          
          <a
            href={opportunity.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center font-bold transition-all select-none rounded-xl py-3 px-6 text-sm sm:text-base bg-indigo-900/60 hover:bg-indigo-900 text-white border border-indigo-400/30 shadow-md gap-2 shrink-0"
          >
            <span>Apply on Official Website</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* 9.5 RECOMMENDED PREPARATION TOOLS & PARTNER RESOURCES (STEP 16) */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
        <AffiliateRecommendationSection
          context={affiliateContext}
          placement="opportunity_detail"
          title="Recommended Tools & Resources"
          subtitle="Selected partner platforms, proposal writing software, and financial planning tools aligned with this opportunity's requirements."
          initialLimit={3}
          maxResults={6}
        />
      </div>

      {/* 10. RELATED OPPORTUNITIES */}
      {relatedOpportunities.length > 0 && (
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                Explore More Opportunities
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Related Funding & Grants
              </h2>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Browse All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {relatedOpportunities.map((relOpp) => (
              <OpportunityCard
                key={relOpp.id}
                opportunity={relOpp}
                onSelect={(opp) => {
                  onSelectOpportunity(opp);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                isBookmarked={false}
                onToggleBookmark={onToggleBookmark}
              />
            ))}
          </div>
        </div>
      )}

      {/* STEP 7: ELIGIBILITY CHECKER MODAL */}
      <EligibilityCheckerModal
        isOpen={isEligibilityModalOpen}
        onClose={() => setIsEligibilityModalOpen(false)}
        opportunity={opportunity}
        initialAssessment={eligibilityAssessment}
        onAssessmentCompleted={(result) => setEligibilityAssessment(result)}
        onNavigate={onNavigate}
      />

      {/* STEP 9: DEADLINE REMINDER CONFIGURATION MODAL */}
      <DeadlineReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        opportunity={opportunity}
        onSaved={() => {
          setTrackedDeadlineInfo(getTrackedDeadlineForOpportunity(opportunity.id));
        }}
        onRemoved={() => {
          setTrackedDeadlineInfo(null);
        }}
      />

      {/* STEP 13: SEO & SCHEMA INSPECTOR MODAL */}
      <SEOInspectorModal
        isOpen={isSEOInspectorOpen}
        onClose={() => setIsSEOInspectorOpen(false)}
        metadata={seoMetadata}
        allOpportunities={allOpportunities}
        allCategories={allCategories}
      />

      {/* MILESTONE PLANNER MODAL */}
      {isMilestoneModalOpen && (
        <MilestonePlannerModal
          isOpen={isMilestoneModalOpen}
          onClose={() => setIsMilestoneModalOpen(false)}
          opportunity={opportunity}
          onNavigateToWorkspace={() => onNavigate('application-workspace')}
        />
      )}

      {/* STEP 22: APPLICATION TRACKING & DETAILS MODAL */}
      <ApplicationDetailsModal
        isOpen={isTrackerModalOpen}
        application={existingApplication}
        onClose={() => setIsTrackerModalOpen(false)}
        onNavigateToOpportunity={() => setIsTrackerModalOpen(false)}
        onStatusChange={async (appId, newStatus) => {
          await updateApplicationStatus(appId, newStatus, userId);
          setExistingApplication((prev) => prev ? { ...prev, status: newStatus } : null);
        }}
        onNotesChange={async (appId, notes) => {
          await updateApplicationNotes(appId, notes, userId);
          setExistingApplication((prev) => prev ? { ...prev, notes } : null);
        }}
        onOpenWorkspace={() => {
          setIsTrackerModalOpen(false);
          onNavigate('application-workspace');
        }}
        onDeleteApplication={async (appId) => {
          await deleteApplication(appId, userId);
          setExistingApplication(null);
        }}
      />
    </div>
  );
};
