import React, { useState, useEffect } from 'react';
import { PageId, Opportunity, Theme, UserProfile } from './types';
import { CATEGORIES_DATA } from './data/categories';
import { SAMPLE_OPPORTUNITIES } from './data/sampleOpportunities';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { OpportunityDetailPage } from './pages/OpportunityDetailPage';
import { ApplicationWorkspacePage } from './pages/ApplicationWorkspacePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { SavedOpportunitiesPage } from './pages/SavedOpportunitiesPage';
import { RecommendedPage } from './pages/RecommendedPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPage } from './pages/AdminPage';
import { CategoryLandingPage } from './pages/CategoryLandingPage';
import { CountryLandingPage } from './pages/CountryLandingPage';
import { FundingTypeLandingPage } from './pages/FundingTypeLandingPage';
import { DirectoryPage } from './pages/DirectoryPage';
import { CalendarPage } from './pages/CalendarPage';
import { FundersPage } from './pages/FundersPage';
import { FunderDetailPage } from './pages/FunderDetailPage';
import { PricingPage } from './pages/PricingPage';
import { CreditsPage } from './pages/CreditsPage';
import { FeatureGateModal } from './components/monetization/FeatureGateModal';
import { CreditPurchaseModal } from './components/monetization/CreditPurchaseModal';
import { InsufficientCreditsModal } from './components/monetization/InsufficientCreditsModal';
import { useMonetization } from './context/MonetizationContext';
import { SEOHead } from './components/seo/SEOHead';
import { 
  COUNTRY_SEO_PROFILES, 
  FUNDING_TYPE_SEO_PROFILES, 
  getSiteOrigin, 
  slugify,
  getCountryBySlugOrName,
  getFundingTypeBySlug
} from './utils/seoUtils';
import { SEOMetaData } from './types/seo';
import { AuthPromptModal } from './components/auth/AuthPromptModal';
import { ToastContainer, ToastItem } from './components/ui/Toast';
import { NotificationCenter } from './components/notifications/NotificationCenter';
import { AppNotification } from './types/notification';
import { 
  getPublicOpportunities, 
  getAdminCategories,
  getAllAdminOpportunities
} from './utils/adminStorage';
import { 
  getCurrentUser,
  getRecentlyViewedOpportunityIds, 
  recordOpportunityView,
} from './utils/auth';
import { useAuth } from './context/AuthContext';
import { AuthRouteGuard } from './components/auth/AuthRouteGuard';
import {
  subscribeToUserNotifications,
  markNotificationAsRead as markNotificationAsReadFirestore,
  markAllNotificationsAsRead as markAllNotificationsAsReadFirestore,
  deleteNotification as deleteNotificationFirestore,
} from './services/firebase/notificationService';
import { processApplicationDeadlineReminders } from './services/firebase/deadlineReminderService';
import {
  fetchFundingOpportunitiesFromFirestore,
  saveOpportunityToFirestore,
  unsaveOpportunityFromFirestore,
  fetchUserSavedOpportunityIds,
  syncUserDocumentToFirestore,
  testFirestoreConnection,
} from './services/firebase';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [previousPage, setPreviousPage] = useState<PageId>('opportunities');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Step 13: SEO Landing Page Navigation States
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('business-startups');
  const [selectedCountrySlug, setSelectedCountrySlug] = useState<string>('nigeria');
  const [selectedFundingTypeSlug, setSelectedFundingTypeSlug] = useState<string>('grants');
  const [selectedFunderSlug, setSelectedFunderSlug] = useState<string>('gates-foundation');

  // Dynamic Opportunities & Categories loaded from Admin Persistence
  const [allOpportunities, setAllOpportunities] = useState<Opportunity[]>(() => getPublicOpportunities());
  const [allCategories, setAllCategories] = useState(() => getAdminCategories());

  // Firebase Authoritative Authentication State
  const { 
    user, 
    isLoading: isAuthLoading, 
    logout: authLogout, 
    refreshProfile 
  } = useAuth();
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [pendingSaveOpportunity, setPendingSaveOpportunity] = useState<Opportunity | null>(null);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => getRecentlyViewedOpportunityIds());

  // Step 14: Monetization Modals & State
  const { 
    isUpgradeModalOpen, 
    closeUpgradeModal, 
    isCreditModalOpen, 
    closeCreditModal,
    isInsufficientModalOpen,
    closeInsufficientModal 
  } = useMonetization();

  // Step 9 & 23: In-App Notification Center State (Firestore-backed)
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const refreshCatalogData = () => {
    fetchFundingOpportunitiesFromFirestore().then(({ opportunities }) => {
      if (opportunities && opportunities.length > 0) {
        setAllOpportunities(opportunities);
      } else {
        const opps = getPublicOpportunities();
        setAllOpportunities(opps);
      }
    }).catch(() => {
      const opps = getPublicOpportunities();
      setAllOpportunities(opps);
    });

    const cats = getAdminCategories();
    setAllCategories(cats);
  };

  // STEP 19: Firestore Initial Sync & Connection Test
  useEffect(() => {
    testFirestoreConnection().catch(() => {});

    fetchFundingOpportunitiesFromFirestore().then(({ opportunities }) => {
      if (opportunities && opportunities.length > 0) {
        setAllOpportunities(opportunities);
      }
    }).catch((err) => {
      console.warn('[FUNDORA] Initial Firestore catalog fetch warning:', err);
    });
  }, []);

  // STEP 19 & 21: Firestore Saved Opportunities & User Profile Sync (Strict User Isolation)
  useEffect(() => {
    if (user?.id) {
      // 1. User-isolated bookmarks: retrieve cached or fresh bookmarks for this specific UID
      const userStorageKey = `fundora_saved_opportunities_${user.id}`;
      try {
        const cached = localStorage.getItem(userStorageKey);
        if (cached) {
          setBookmarkedIds(new Set(JSON.parse(cached)));
        } else {
          setBookmarkedIds(new Set());
        }
      } catch {
        setBookmarkedIds(new Set());
      }

      fetchUserSavedOpportunityIds(user.id)
        .then(({ savedIds }) => {
          if (savedIds) {
            setBookmarkedIds(new Set(savedIds));
            try {
              localStorage.setItem(userStorageKey, JSON.stringify(savedIds));
            } catch {}
          }
        })
        .catch((err) => {
          console.warn('[FUNDORA] Firestore saved opportunities load warning:', err);
        });

      // 2. Synchronize user document to Firestore "users" collection (Step 19 Architecture)
      if (user.email) {
        syncUserDocumentToFirestore({
          uid: user.id,
          fullName: user.name,
          email: user.email,
          country: user.country,
          interests: user.interests,
          organizationType: user.userType || 'Early-Stage Innovator',
          profileCompleted: Boolean(user.profileCompletion && user.profileCompletion >= 50),
          role: user.role,
        }).catch((err) => {
          console.warn('[FUNDORA] User sync to Firestore warning:', err);
        });
      }
    } else {
      // User is logged out: completely clear saved opportunities
      setBookmarkedIds(new Set());
    }
  }, [user?.id, user?.email]);

  // STEP 23: Real-Time Firestore Notifications & Isolated Deadline Alerts
  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      return;
    }

    // 1. Subscribe to real-time notifications for the authenticated user from Firestore
    const unsubscribe = subscribeToUserNotifications(
      user.id,
      (fetchedNotifs) => {
        setNotifications(fetchedNotifs);
      },
      (err) => {
        console.warn('[FUNDORA] Notifications subscription warning:', err);
      }
    );

    // 2. Process deadline reminders on initial load/login for active applications
    processApplicationDeadlineReminders(user.id).catch((err) => {
      console.warn('[FUNDORA] Deadline reminder processing warning:', err);
    });

    return () => {
      unsubscribe();
    };
  }, [user?.id]);

  const unreadNotificationCount = notifications.filter((n) => !(n.read ?? n.isRead)).length;

  const handleMarkNotificationAsRead = (id: string) => {
    if (user?.id) {
      markNotificationAsReadFirestore(user.id, id);
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, isRead: true } : n))
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    if (user?.id) {
      markAllNotificationsAsReadFirestore(user.id);
    }
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, isRead: true }))
    );
    addToast({
      title: 'Notifications Cleared',
      description: 'All notifications have been marked as read.',
      type: 'info',
      duration: 2500,
    });
  };

  const handleDeleteNotification = (id: string) => {
    if (user?.id) {
      deleteNotificationFirestore(user.id, id);
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAllNotifications = () => {
    if (user?.id) {
      markAllNotificationsAsReadFirestore(user.id);
    }
    setNotifications([]);
  };

  const handleSelectOpportunityById = (oppId: string) => {
    const found = allOpportunities.find((o) => o.id === oppId);
    if (found) {
      handleSelectOpportunity(found);
      setIsNotificationCenterOpen(false);
    } else {
      handleNavigate('opportunities');
      setIsNotificationCenterOpen(false);
    }
  };
  
  // Toast Notifications State
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
  
  // Theme state with localStorage hydration
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const savedTheme = localStorage.getItem('fundora_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // Fallback
    }
    return 'light';
  });

  // Apply dark class to document root
  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('fundora_theme', theme);
    } catch {
      // Ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Bookmarks state with initial localStorage hydration
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('fundora_saved_opportunities');
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {
      // Fallback
    }
    return new Set([]); // Empty initial bookmarks for clean production
  });

  // Persist bookmarks
  useEffect(() => {
    try {
      localStorage.setItem('fundora_saved_opportunities', JSON.stringify(Array.from(bookmarkedIds)));
    } catch {
      // Ignore
    }
  }, [bookmarkedIds]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleToggleBookmark = (opportunity: Opportunity) => {
    const isCurrentlySaved = bookmarkedIds.has(opportunity.id);

    // If user is not logged in and attempting to save (not remove), show auth modal prompt
    if (!user && !isCurrentlySaved) {
      setPendingSaveOpportunity(opportunity);
      setAuthPromptOpen(true);
      return;
    }

    if (isCurrentlySaved) {
      // Removing bookmark (Optimistic UI)
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        next.delete(opportunity.id);
        if (user?.id) {
          try {
            localStorage.setItem(`fundora_saved_opportunities_${user.id}`, JSON.stringify(Array.from(next)));
          } catch {}
        }
        return next;
      });

      // Firestore Persistence
      if (user?.id) {
        unsaveOpportunityFromFirestore(user.id, opportunity.id).catch((err) => {
          console.warn('[FUNDORA] Failed to unsave from Firestore:', err);
        });
      }

      addToast({
        title: 'Removed from Bookmarks',
        description: `"${opportunity.title}" was removed from your saved list.`,
        type: 'info',
        duration: 4000,
        action: {
          label: 'Undo',
          onClick: () => {
            setBookmarkedIds((prev) => {
              const next = new Set(prev).add(opportunity.id);
              if (user?.id) {
                try {
                  localStorage.setItem(`fundora_saved_opportunities_${user.id}`, JSON.stringify(Array.from(next)));
                } catch {}
              }
              return next;
            });
            if (user?.id) {
              saveOpportunityToFirestore(user.id, opportunity.id).catch(() => {});
            }
            addToast({
              title: 'Saved to Bookmarks',
              description: `"${opportunity.title}" was restored.`,
              type: 'success',
              duration: 3000,
            });
          },
        },
      });
    } else {
      // Adding bookmark (Optimistic UI)
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        next.add(opportunity.id);
        if (user?.id) {
          try {
            localStorage.setItem(`fundora_saved_opportunities_${user.id}`, JSON.stringify(Array.from(next)));
          } catch {}
        }
        return next;
      });

      // Firestore Persistence
      if (user?.id) {
        saveOpportunityToFirestore(user.id, opportunity.id).catch((err) => {
          console.warn('[FUNDORA] Failed to save to Firestore:', err);
        });
      }

      addToast({
        title: 'Saved to Bookmarks',
        description: `"${opportunity.title}" added to your saved opportunities.`,
        type: 'success',
        duration: 4000,
        action: {
          label: user ? 'View Saved' : 'View List',
          onClick: () => {
            if (user) {
              handleNavigate('saved');
            } else {
              handleNavigate('opportunities');
            }
          },
        },
      });
    }
  };

  const handleSelectOpportunity = (opportunity: Opportunity) => {
    setPreviousPage(currentPage === 'opportunity-detail' ? 'opportunities' : currentPage);
    setSelectedOpportunity(opportunity);
    
    // Add to recently viewed history
    const updatedIds = recordOpportunityView(opportunity.id);
    setRecentlyViewedIds(updatedIds);

    setCurrentPage('opportunity-detail');
  };

  const handleBackFromDetail = () => {
    if (previousPage === 'home') {
      setCurrentPage('home');
    } else if (previousPage === 'dashboard') {
      setCurrentPage('dashboard');
    } else if (previousPage === 'saved') {
      setCurrentPage('saved');
    } else {
      setCurrentPage('opportunities');
    }
  };

  const handleNavigate = (page: PageId) => {
    if (page !== 'opportunity-detail') {
      setSelectedOpportunity(null);
    }
    setCurrentPage(page);
  };

  const handleHeroSearchSubmit = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory('all');
    setSelectedOpportunity(null);
    setCurrentPage('opportunities');
  };

  const handleCategorySelect = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setSearchQuery('');
    setSelectedOpportunity(null);
    setCurrentPage('opportunities');
  };

  // Step 13: Direct SEO Landing Page Navigation Handlers
  const handleSelectCategoryLanding = (categorySlug: string) => {
    setSelectedCategorySlug(categorySlug);
    setSelectedOpportunity(null);
    setCurrentPage('category-landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCountryLanding = (countrySlug: string) => {
    setSelectedCountrySlug(countrySlug);
    setSelectedOpportunity(null);
    setCurrentPage('country-landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectFundingTypeLanding = (typeSlug: string) => {
    setSelectedFundingTypeSlug(typeSlug);
    setSelectedOpportunity(null);
    setCurrentPage('funding-type-landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectFunder = (funderSlug: string) => {
    setSelectedFunderSlug(funderSlug);
    setSelectedOpportunity(null);
    setCurrentPage('funder-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSaved = () => {
    if (user) {
      handleNavigate('saved');
    } else {
      handleNavigate('opportunities');
    }
  };

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    // If there was a pending save, apply it to Firestore now
    if (pendingSaveOpportunity) {
      setBookmarkedIds((prev) => new Set(prev).add(pendingSaveOpportunity.id));
      if (loggedInUser?.id) {
        saveOpportunityToFirestore(loggedInUser.id, pendingSaveOpportunity.id).catch(() => {});
      }
      addToast({
        title: 'Saved to Account',
        description: `"${pendingSaveOpportunity.title}" added to your bookmarks.`,
        type: 'success',
        duration: 4500,
        action: {
          label: 'View Saved',
          onClick: () => handleNavigate('saved'),
        },
      });
      setPendingSaveOpportunity(null);
    } else {
      addToast({
        title: `Welcome back, ${loggedInUser.name}!`,
        description: 'Successfully signed in to your FundEcho account.',
        type: 'success',
        duration: 3500,
      });
    }
    
    setCurrentPage('dashboard');
  };

  const handleSignUpSuccess = (newUser: UserProfile) => {
    // If there was a pending save, apply it to Firestore now
    if (pendingSaveOpportunity) {
      setBookmarkedIds((prev) => new Set(prev).add(pendingSaveOpportunity.id));
      if (newUser?.id) {
        saveOpportunityToFirestore(newUser.id, pendingSaveOpportunity.id).catch(() => {});
      }
      addToast({
        title: 'Saved to Account',
        description: `"${pendingSaveOpportunity.title}" added to your bookmarks.`,
        type: 'success',
        duration: 4500,
        action: {
          label: 'View Saved',
          onClick: () => handleNavigate('saved'),
        },
      });
      setPendingSaveOpportunity(null);
    } else {
      addToast({
        title: `Welcome to FundEcho, ${newUser.name}!`,
        description: 'Your account was created successfully.',
        type: 'success',
        duration: 3500,
      });
    }

    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    await authLogout();
    setBookmarkedIds(new Set());
    addToast({
      title: 'Signed Out',
      description: 'You have been safely signed out.',
      type: 'info',
      duration: 3000,
    });
    setCurrentPage('home');
  };

  const handleGuestSaveConfirm = (opportunity: Opportunity) => {
    setBookmarkedIds((prev) => new Set(prev).add(opportunity.id));
    setPendingSaveOpportunity(null);
    addToast({
      title: 'Saved for This Session',
      description: `"${opportunity.title}" was saved locally in your browser.`,
      type: 'success',
      duration: 4000,
      action: {
        label: 'View Opportunities',
        onClick: () => handleNavigate('opportunities'),
      },
    });
  };

  const handleClearBrowsingHistory = () => {
    setRecentlyViewedIds([]);
    addToast({
      title: 'Browsing History Cleared',
      description: 'Your recently viewed opportunities have been reset.',
      type: 'info',
      duration: 3000,
    });
  };

  // General Page SEO metadata generator
  const getStaticPageSEO = (): SEOMetaData | null => {
    const origin = getSiteOrigin();
    
    // Pages that manage their own detailed dynamic SEO tags
    if (['opportunity-detail', 'category-landing', 'country-landing', 'funding-type-landing', 'directory', 'funders', 'funder-detail', 'calendar', 'pricing', 'credits'].includes(currentPage)) {
      return null;
    }

    const isPrivate = ['login', 'signup', 'forgot-password', 'dashboard', 'saved', 'recommended', 'profile', 'settings', 'admin', 'application-workspace'].includes(currentPage);

    if (isPrivate) {
      const pageTitles: Record<string, string> = {
        login: 'Sign In to Your Account | FundEcho',
        signup: 'Create Your Free Account | FundEcho',
        'forgot-password': 'Reset Password | FundEcho',
        dashboard: 'User Dashboard & Tracked Grants | FundEcho',
        saved: 'My Bookmarked Opportunities | FundEcho',
        recommended: 'Matched & Recommended Opportunities | FundEcho',
        profile: 'User Profile & Preferences | FundEcho',
        settings: 'Account Settings & Notifications | FundEcho',
        admin: 'Admin Verification & Pipeline Console | FundEcho',
        'application-workspace': 'Proposal & Application Workspace | FundEcho'
      };

      return {
        title: pageTitles[currentPage] || 'FundEcho Account',
        description: 'Private user portal and application tracking system on FundEcho.',
        canonicalUrl: `${origin}/${currentPage}`,
        robots: 'noindex, nofollow'
      };
    }

    if (currentPage === 'opportunities') {
      return {
        title: 'Explore All Verified Grants & Funding Opportunities | FundEcho (2026)',
        description: 'Search, filter, and discover over 12,400+ verified global grants, scholarships, fellowships, and startup funding competitions with zero application fees.',
        canonicalUrl: `${origin}/opportunities`,
        keywords: ['funding directory', 'verified grants', 'startup funding', 'global scholarships', 'grant search'],
        ogType: 'website',
        robots: 'index, follow'
      };
    }

    if (currentPage === 'about') {
      return {
        title: 'About FundEcho — The Verified Funding & Grant Discovery Network',
        description: 'Learn about FundEcho’s mission to connect entrepreneurs, researchers, students, and NGOs to legitimate non-dilutive capital worldwide with rigorous scam prevention.',
        canonicalUrl: `${origin}/about`,
        keywords: ['about FundEcho', 'grant verification standards', 'funding discovery mission', 'non-dilutive funding'],
        ogType: 'website',
        robots: 'index, follow'
      };
    }

    if (currentPage === 'contact') {
      return {
        title: 'Contact FundEcho — Editorial, Support & Verification Desk',
        description: 'Get in touch with the FundEcho editorial team to submit funding opportunities, report invalid listings, or propose institutional partnerships.',
        canonicalUrl: `${origin}/contact`,
        keywords: ['contact FundEcho', 'submit grant opportunity', 'grant publisher support'],
        ogType: 'website',
        robots: 'index, follow'
      };
    }

    // Default Home Page SEO
    return {
      title: 'FundEcho — Verified Grants, Scholarships & Non-Dilutive Funding (2026)',
      description: 'Discover curated and verified grants, scholarships, fellowships, and non-dilutive funding opportunities globally. 100% scam-free, zero paywalls.',
      canonicalUrl: `${origin}/`,
      keywords: ['grants', 'scholarships', 'fellowships', 'startup funding', 'research funding', 'non-dilutive capital'],
      ogType: 'website',
      robots: 'index, follow'
    };
  };

  const staticSEO = getStaticPageSEO();

  return (
    <div className="min-h-screen w-full max-w-full flex flex-col bg-slate-50 dark:bg-[#080c14] text-slate-900 dark:text-slate-100 selection:bg-indigo-600 selection:text-white overflow-x-clip transition-colors duration-200">
      {/* Global Fallback SEO Head for Static / Private Pages */}
      {staticSEO && <SEOHead metadata={staticSEO} />}

      {/* 1. Header & Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        savedCount={bookmarkedIds.size}
        onOpenSaved={handleOpenSaved}
        unreadNotificationCount={unreadNotificationCount}
        onOpenNotificationCenter={() => setIsNotificationCenterOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        user={user}
        onLogout={handleLogout}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 w-full max-w-full overflow-x-clip">
        {currentPage === 'home' && (
          <HomePage
            userProfile={user}
            categories={allCategories}
            opportunities={allOpportunities}
            onNavigate={handleNavigate}
            onSelectOpportunity={handleSelectOpportunity}
            onSelectCategory={handleCategorySelect}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onSearchSubmit={handleHeroSearchSubmit}
          />
        )}

        {currentPage === 'opportunities' && (
          <OpportunitiesPage
            userProfile={user}
            opportunities={allOpportunities}
            categories={allCategories}
            initialSearch={searchQuery}
            initialCategory={selectedCategory}
            onSelectOpportunity={handleSelectOpportunity}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {currentPage === 'opportunity-detail' && selectedOpportunity && (
          <OpportunityDetailPage
            opportunity={selectedOpportunity}
            allOpportunities={allOpportunities}
            onNavigate={handleNavigate}
            onSelectOpportunity={handleSelectOpportunity}
            isBookmarked={bookmarkedIds.has(selectedOpportunity.id)}
            onToggleBookmark={handleToggleBookmark}
            onBackToDirectory={handleBackFromDetail}
            onSelectCategory={handleSelectCategoryLanding}
            onSelectCountry={handleSelectCountryLanding}
            onSelectFundingType={handleSelectFundingTypeLanding}
            onSelectFunder={handleSelectFunder}
          />
        )}

        {/* STEP 13: SEO & DISCOVERABILITY LANDING PAGES */}
        {currentPage === 'category-landing' && (
          <CategoryLandingPage
            categorySlug={selectedCategorySlug}
            category={allCategories.find((c) => c && (c.slug === selectedCategorySlug || slugify(c.name) === selectedCategorySlug || c.id === selectedCategorySlug))}
            allOpportunities={allOpportunities}
            allCategories={allCategories}
            onNavigate={handleNavigate}
            onSelectOpportunity={handleSelectOpportunity}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onSelectCategory={handleSelectCategoryLanding}
            onSelectCountry={handleSelectCountryLanding}
            onSelectFundingType={handleSelectFundingTypeLanding}
          />
        )}

        {currentPage === 'country-landing' && (
          <CountryLandingPage
            countrySlug={selectedCountrySlug}
            country={getCountryBySlugOrName(selectedCountrySlug)}
            allOpportunities={allOpportunities}
            allCategories={allCategories}
            onNavigate={handleNavigate}
            onSelectOpportunity={handleSelectOpportunity}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onSelectCategory={handleSelectCategoryLanding}
            onSelectCountry={handleSelectCountryLanding}
            onSelectFundingType={handleSelectFundingTypeLanding}
          />
        )}

        {currentPage === 'funding-type-landing' && (
          <FundingTypeLandingPage
            fundingTypeSlug={selectedFundingTypeSlug}
            fundingType={getFundingTypeBySlug(selectedFundingTypeSlug)}
            allOpportunities={allOpportunities}
            allCategories={allCategories}
            onNavigate={handleNavigate}
            onSelectOpportunity={handleSelectOpportunity}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onSelectCategory={handleSelectCategoryLanding}
            onSelectCountry={handleSelectCountryLanding}
            onSelectFundingType={handleSelectFundingTypeLanding}
          />
        )}

        {currentPage === 'directory' && (
          <DirectoryPage
            allOpportunities={allOpportunities}
            allCategories={allCategories}
            onNavigate={handleNavigate}
            onSelectOpportunity={handleSelectOpportunity}
            onSelectCategory={handleSelectCategoryLanding}
            onSelectCountry={handleSelectCountryLanding}
            onSelectFundingType={handleSelectFundingTypeLanding}
          />
        )}

        {/* CALENDAR PAGE */}
        {currentPage === 'calendar' && (
          <CalendarPage
            allOpportunities={allOpportunities}
            allCategories={allCategories}
            onNavigate={handleNavigate}
            onSelectOpportunity={handleSelectOpportunity}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {/* FUNDERS DIRECTORY PAGE */}
        {currentPage === 'funders' && (
          <FundersPage
            allOpportunities={allOpportunities}
            onNavigate={handleNavigate}
            onSelectFunder={handleSelectFunder}
            onSelectOpportunity={handleSelectOpportunity}
          />
        )}

        {/* FUNDER PROFILE DETAIL PAGE */}
        {currentPage === 'funder-detail' && (
          <FunderDetailPage
            funderSlug={selectedFunderSlug}
            allOpportunities={allOpportunities}
            onNavigate={handleNavigate}
            onSelectOpportunity={handleSelectOpportunity}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onSelectCategory={handleSelectCategoryLanding}
            onSelectCountry={handleSelectCountryLanding}
            onSelectFundingType={handleSelectFundingTypeLanding}
          />
        )}

        {currentPage === 'application-workspace' && (
          <AuthRouteGuard
            page="application-workspace"
            user={user}
            isLoading={isAuthLoading}
            onNavigate={handleNavigate}
          >
            <ApplicationWorkspacePage
              opportunity={selectedOpportunity || allOpportunities[0]}
              userProfile={user}
              onBackToOpportunity={() => {
                if (selectedOpportunity) {
                  handleNavigate('opportunity-detail');
                } else {
                  handleNavigate('opportunities');
                }
              }}
            />
          </AuthRouteGuard>
        )}

        {currentPage === 'about' && (
          <AboutPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'contact' && (
          <ContactPage />
        )}

        {/* STEP 5 USER ACCOUNT PAGES */}
        {currentPage === 'login' && (
          <LoginPage
            onNavigate={handleNavigate}
            onLoginSuccess={handleLoginSuccess}
            pendingSaveTitle={pendingSaveOpportunity?.title}
          />
        )}

        {currentPage === 'signup' && (
          <SignUpPage
            onNavigate={handleNavigate}
            onSignUpSuccess={handleSignUpSuccess}
            pendingSaveTitle={pendingSaveOpportunity?.title}
          />
        )}

        {currentPage === 'forgot-password' && (
          <ForgotPasswordPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'dashboard' && (
          <AuthRouteGuard
            page="dashboard"
            user={user}
            isLoading={isAuthLoading}
            onNavigate={handleNavigate}
          >
            {user && (
              <DashboardPage
                user={user}
                allOpportunities={allOpportunities}
                bookmarkedIds={bookmarkedIds}
                recentlyViewedIds={recentlyViewedIds}
                onNavigate={handleNavigate}
                onSelectOpportunity={handleSelectOpportunity}
                onToggleBookmark={handleToggleBookmark}
              />
            )}
          </AuthRouteGuard>
        )}

        {currentPage === 'recommended' && (
          <AuthRouteGuard
            page="recommended"
            user={user}
            isLoading={isAuthLoading}
            onNavigate={handleNavigate}
          >
            {user && (
              <RecommendedPage
                user={user}
                allOpportunities={allOpportunities}
                bookmarkedIds={bookmarkedIds}
                onNavigate={handleNavigate}
                onSelectOpportunity={handleSelectOpportunity}
                onToggleBookmark={handleToggleBookmark}
              />
            )}
          </AuthRouteGuard>
        )}

        {currentPage === 'saved' && (
          <AuthRouteGuard
            page="saved"
            user={user}
            isLoading={isAuthLoading}
            onNavigate={handleNavigate}
          >
            <SavedOpportunitiesPage
            userProfile={user}
            allOpportunities={allOpportunities}
              bookmarkedIds={bookmarkedIds}
              onNavigate={handleNavigate}
              onSelectOpportunity={handleSelectOpportunity}
              onToggleBookmark={handleToggleBookmark}
            />
          </AuthRouteGuard>
        )}

        {currentPage === 'profile' && (
          <AuthRouteGuard
            page="profile"
            user={user}
            isLoading={isAuthLoading}
            onNavigate={handleNavigate}
          >
            {user && (
              <ProfilePage
                user={user}
                onNavigate={handleNavigate}
                onUpdateUser={() => {
                  refreshProfile().catch(() => {});
                }}
              />
            )}
          </AuthRouteGuard>
        )}

        {currentPage === 'settings' && (
          <AuthRouteGuard
            page="settings"
            user={user}
            isLoading={isAuthLoading}
            onNavigate={handleNavigate}
          >
            {user && (
              <SettingsPage
                user={user}
                allOpportunities={allOpportunities}
                bookmarkedIds={bookmarkedIds}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
                theme={theme}
                onToggleTheme={toggleTheme}
                onClearHistory={handleClearBrowsingHistory}
              />
            )}
          </AuthRouteGuard>
        )}

        {/* STEP 10: ADMIN & MODERATION CONSOLE */}
        {currentPage === 'admin' && (
          <AuthRouteGuard
            page="admin"
            user={user}
            requireAdmin={true}
            isLoading={isAuthLoading}
            onNavigate={handleNavigate}
          >
            <AdminPage
              currentUser={user}
              onNavigate={handleNavigate}
              onOpportunityUpdated={refreshCatalogData}
            />
          </AuthRouteGuard>
        )}

        {/* STEP 14: MONETIZATION, PLANS & CREDITS */}
        {currentPage === 'pricing' && (
          <PricingPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'credits' && (
          <CreditsPage onNavigate={handleNavigate} />
        )}
      </main>

      {/* 3. Auth Prompt Modal for Guests Saving an Opportunity */}
      {authPromptOpen && (
        <AuthPromptModal
          isOpen={authPromptOpen}
          onClose={() => {
            setAuthPromptOpen(false);
            setPendingSaveOpportunity(null);
          }}
          onNavigate={handleNavigate}
          pendingOpportunity={pendingSaveOpportunity}
          onGuestSaveConfirm={handleGuestSaveConfirm}
        />
      )}

      {/* 4. Global Footer */}
      <Footer
        onNavigate={handleNavigate}
        onSelectCategory={handleSelectCategoryLanding}
      />

      {/* 5. Notification Center Drawer / Popover */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        userId={user?.id}
        notifications={notifications}
        unreadCount={unreadNotificationCount}
        onMarkAsRead={handleMarkNotificationAsRead}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        onDeleteNotification={handleDeleteNotification}
        onClearAll={handleClearAllNotifications}
        onNavigate={(page) => {
          setIsNotificationCenterOpen(false);
          handleNavigate(page);
        }}
        onSelectOpportunityById={handleSelectOpportunityById}
        onOpenWorkspaceDraft={(draftId) => {
          setIsNotificationCenterOpen(false);
          handleNavigate('application-workspace');
        }}
      />

      {/* 6. Step 14 Feature Gate and Credit Modals */}
      <FeatureGateModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        onNavigateToPricing={() => handleNavigate('pricing')}
        onNavigateToCredits={() => handleNavigate('credits')}
      />

      <CreditPurchaseModal
        isOpen={isCreditModalOpen}
        onClose={closeCreditModal}
        onNavigateToCreditsPage={() => handleNavigate('credits')}
      />

      <InsufficientCreditsModal
        isOpen={isInsufficientModalOpen}
        onClose={closeInsufficientModal}
        onNavigateToPricing={() => handleNavigate('pricing')}
        onNavigateToCredits={() => handleNavigate('credits')}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

