import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  PlusCircle, 
  Clock, 
  Tag, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowLeft,
  Filter,
  Sparkles,
  GitBranch,
  DollarSign,
  Globe
} from 'lucide-react';
import { Opportunity, Category, UserProfile, PageId } from '../types';
import { 
  AdminTabId, 
  OpportunityFormData, 
  PublicationStatus, 
  AdminVerificationStatus,
  AccountStatus,
  AdminUserRecord
} from '../types/admin';
import { 
  getAllAdminOpportunities, 
  getAdminCategories, 
  getAdminUsersList, 
  getAdminPlatformStats,
  saveOpportunity,
  deleteAdminOpportunity,
  updateOpportunityPublicationStatus,
  updateOpportunityVerificationStatus,
  saveAdminCategory,
  deleteAdminCategory,
  updateAdminUserStatus,
  updateAdminUserRole
} from '../utils/adminStorage';
import { getIncomingOpportunities } from '../utils/pipelineStorage';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminDashboardOverview } from '../components/admin/AdminDashboardOverview';
import { OpportunityManagementTable } from '../components/admin/OpportunityManagementTable';
import { AddEditOpportunityForm } from '../components/admin/AddEditOpportunityForm';
import { ModerationReviewQueue } from '../components/admin/ModerationReviewQueue';
import { CategoryManagement } from '../components/admin/CategoryManagement';
import { UserOverviewTable } from '../components/admin/UserOverviewTable';
import { OpportunityPreviewModal } from '../components/admin/OpportunityPreviewModal';
import { OpportunityPipelineSection } from '../components/admin/pipeline/OpportunityPipelineSection';
import { SourceRegistryManagement } from '../components/admin/SourceRegistryManagement';
import { AffiliateAdminManager } from '../components/affiliate/AffiliateAdminManager';
import { AdminMonetizationSection } from '../components/admin/monetization/AdminMonetizationSection';
import { 
  fetchFundingOpportunitiesFromFirestore,
  saveOpportunityToFirestoreAdmin, 
  deleteOpportunityFromFirestoreAdmin, 
  updateOpportunityStatusInFirestore, 
  updateOpportunityVerificationInFirestore, 
  updateOpportunityFeaturedInFirestore 
} from '../services/firebase/firestoreService';
import {
  fetchCategoriesFromFirestore,
  saveCategoryToFirestore,
  deleteCategoryFromFirestore,
} from '../services/firebase/categoryService';
import {
  fetchUsersFromFirestore,
  updateUserRole as updateUserRoleFirestore,
  updateUserAccountStatus as updateUserAccountStatusFirestore,
} from '../services/firebase/userService';
import { checkOpportunityForFollowerNotifications } from '../services/firebase/funderFollowService';

const FALLBACK_ADMIN_USER: UserProfile = {
  id: 'admin-fundecho-main',
  name: 'Platform Administrator',
  email: 'admin@fundecho.org',
  country: 'Global',
  interests: ['grants', 'business-funding'],
  preferredFundingTypes: ['Grant', 'Business Funding'],
  avatarBg: 'bg-indigo-700',
  initials: 'AD',
  createdAt: '2026-01-01',
  role: 'admin',
};

export interface AdminPageProps {
  currentUser: UserProfile | null;
  onNavigate: (page: PageId) => void;
  onOpportunityUpdated?: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  currentUser,
  onNavigate,
  onOpportunityUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTabId>('dashboard');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [adminUsers, setAdminUsers] = useState(getAdminUsersList());
  const [stats, setStats] = useState(getAdminPlatformStats());

  // Modal / Editing state
  const [previewOpportunity, setPreviewOpportunity] = useState<Opportunity | null>(null);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reload all registries
  const reloadData = async () => {
    let opps = getAllAdminOpportunities();
    try {
      const res = await fetchFundingOpportunitiesFromFirestore();
      if (res && res.opportunities && res.opportunities.length > 0) {
        opps = res.opportunities;
      }
    } catch (e) {
      console.warn('Firestore fetch fallback to admin storage:', e);
    }

    let cats = getAdminCategories();
    try {
      const fbCats = await fetchCategoriesFromFirestore();
      if (fbCats && fbCats.length > 0) {
        cats = fbCats;
      }
    } catch (e) {
      console.warn('Firestore categories fetch fallback:', e);
    }

    let usrs: AdminUserRecord[] = [];
    try {
      const fbUsers = await fetchUsersFromFirestore();
      if (fbUsers && fbUsers.length > 0) {
        usrs = fbUsers.map(u => ({
          id: u.id,
          name: u.fullName || u.displayName || 'Opportunity Seeker',
          email: u.email,
          role: (u.role === 'superAdmin' || u.role === 'admin' ? 'admin' : 'user'),
          accountStatus: (u.accountStatus === 'active' ? 'Active' : u.accountStatus === 'suspended' ? 'Suspended' : 'Pending Verification') as AccountStatus,
          country: u.country || 'Global',
          registeredAt: typeof u.createdAt === 'string' ? u.createdAt : new Date().toISOString(),
          lastLoginAt: typeof u.lastLoginAt === 'string' ? u.lastLoginAt : new Date().toISOString(),
          applicantType: u.organizationType || 'Opportunity Seeker',
        }));
      }
    } catch (e) {
      console.warn('Firestore users fetch fallback:', e);
    }

    if (usrs.length === 0) {
      const local = getAdminUsersList().filter(u => !u.email.includes('example.com') && !u.id.includes('demo') && !u.id.includes('sample'));
      if (currentUser && !local.some(u => u.email === currentUser.email)) {
        local.push({
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role === 'admin' ? 'admin' : 'user',
          accountStatus: 'Active',
          country: currentUser.country,
          registeredAt: currentUser.createdAt || new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          applicantType: 'Administrator',
        });
      }
      usrs = local;
    }

    const currentStats = getAdminPlatformStats();

    // Compute dynamic stats based on current opps
    const totalCount = opps.length;
    const openCount = opps.filter(o => (o as any).status === 'Open' || (o.publicationStatus === 'Published' && o.status !== 'Closed')).length;
    const verifyingCount = opps.filter(o => (o as any).status === 'Verifying' || o.publicationStatus === 'Pending Review').length;
    const expiredCount = opps.filter(o => (o as any).status === 'Expired' || o.publicationStatus === 'Expired' || o.status === 'Closed').length;
    const featuredCount = opps.filter(o => Boolean(o.featured)).length;

    setOpportunities(opps);
    setCategories(cats);
    setAdminUsers(usrs);
    setStats({
      ...currentStats,
      totalOpportunities: totalCount,
      publishedOpportunities: openCount,
      pendingReview: verifyingCount,
      archivedOpportunities: expiredCount,
      featuredOpportunities: featuredCount,
    });

    if (onOpportunityUpdated) {
      onOpportunityUpdated();
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Action Handlers
  const handleSaveOpportunity = async (formData: OpportunityFormData) => {
    try {
      // 1. Write to Firestore via admin service (with serverTimestamp and role validation)
      const firestoreResult = await saveOpportunityToFirestoreAdmin(formData);
      // 2. Also keep local storage registry in sync
      const assignedId = (firestoreResult && firestoreResult.id) ? firestoreResult.id : (formData.id || undefined);
      const saved = saveOpportunity({
        ...formData,
        id: assignedId,
      });

      // Notify followers if this opportunity belongs to a followed funder
      checkOpportunityForFollowerNotifications(saved, currentUser?.id).then(({ notifiedCount, funderName }) => {
        if (notifiedCount > 0) {
          console.log(`[Admin] Notified ${notifiedCount} follower(s) of ${funderName} for "${saved.title}"`);
        }
      }).catch(console.warn);

      await reloadData();
      setEditingOpportunity(null);
      showToast(`Opportunity "${formData.title}" saved successfully with status "${formData.status || 'Open'}".`);
      setActiveTab('opportunities');
    } catch (err: any) {
      console.warn('Firestore save fallback to local:', err);
      const saved = saveOpportunity(formData);
      
      checkOpportunityForFollowerNotifications(saved, currentUser?.id).then(({ notifiedCount, funderName }) => {
        if (notifiedCount > 0) {
          console.log(`[Admin] Notified ${notifiedCount} follower(s) of ${funderName} for "${saved.title}"`);
        }
      }).catch(console.warn);

      await reloadData();
      setEditingOpportunity(null);
      showToast(`Saved opportunity "${saved.title}".`);
      setActiveTab('opportunities');
    }
  };

  const handleDeleteOpportunity = async (opportunityId: string) => {
    const opp = opportunities.find((o) => o.id === opportunityId);
    try {
      await deleteOpportunityFromFirestoreAdmin(opportunityId);
    } catch (err) {
      console.warn('Firestore deletion fallback:', err);
    }
    deleteAdminOpportunity(opportunityId);
    await reloadData();
    showToast(`Permanently deleted "${opp?.title || 'opportunity'}" from catalog.`);
  };

  const handleArchiveOpportunity = async (opportunityId: string) => {
    try {
      await updateOpportunityStatusInFirestore(opportunityId, 'Expired');
    } catch (err) {
      console.warn('Firestore archive fallback:', err);
    }
    const opp = opportunities.find((o) => o.id === opportunityId);
    updateOpportunityPublicationStatus(opportunityId, 'Archived');
    await reloadData();
    showToast(`Archived "${opp?.title || 'opportunity'}". Removed from public seeker directory.`);
  };

  const handleApproveAndPublish = async (opportunityId: string, reviewNotes?: string) => {
    try {
      await updateOpportunityVerificationInFirestore(opportunityId, true);
      await updateOpportunityStatusInFirestore(opportunityId, 'Open');
    } catch (err) {
      console.warn('Firestore approve fallback:', err);
    }
    const opp = opportunities.find((o) => o.id === opportunityId);
    updateOpportunityPublicationStatus(opportunityId, 'Published', reviewNotes);
    updateOpportunityVerificationStatus(opportunityId, 'Verified');
    await reloadData();
    showToast(`Approved and published "${opp?.title || 'opportunity'}". Now live on seeker portal.`);
  };

  const handleRequestChanges = async (opportunityId: string, reviewNotes: string) => {
    try {
      await updateOpportunityStatusInFirestore(opportunityId, 'Verifying');
    } catch (err) {
      console.warn('Firestore request changes fallback:', err);
    }
    const opp = opportunities.find((o) => o.id === opportunityId);
    updateOpportunityPublicationStatus(opportunityId, 'Draft', reviewNotes);
    await reloadData();
    showToast(`Requested changes on "${opp?.title || 'opportunity'}". Moved to Draft.`);
  };

  const handleRejectArchive = async (opportunityId: string, reviewNotes: string) => {
    try {
      await updateOpportunityStatusInFirestore(opportunityId, 'Expired');
    } catch (err) {
      console.warn('Firestore reject fallback:', err);
    }
    const opp = opportunities.find((o) => o.id === opportunityId);
    updateOpportunityPublicationStatus(opportunityId, 'Archived', reviewNotes);
    await reloadData();
    showToast(`Rejected and archived "${opp?.title || 'opportunity'}".`);
  };

  const handleStatusChange = async (opportunityId: string, newStatus: 'Open' | 'Verifying' | 'Expired') => {
    try {
      await updateOpportunityStatusInFirestore(opportunityId, newStatus);
    } catch (err) {
      console.warn('Firestore status update fallback:', err);
    }
    const pubStatusMap = {
      Open: 'Published',
      Verifying: 'Pending Review',
      Expired: 'Expired',
    } as const;
    updateOpportunityPublicationStatus(opportunityId, pubStatusMap[newStatus] || 'Published');
    await reloadData();
    showToast(`Updated opportunity status to "${newStatus}".`);
  };

  const handleToggleVerified = async (opportunityId: string, currentVerified: boolean) => {
    const newVerified = !currentVerified;
    try {
      await updateOpportunityVerificationInFirestore(opportunityId, newVerified);
    } catch (err) {
      console.warn('Firestore verification update fallback:', err);
    }
    updateOpportunityVerificationStatus(opportunityId, newVerified ? 'Verified' : 'Unverified');
    await reloadData();
    showToast(`Opportunity marked as ${newVerified ? 'Verified' : 'Unverified'}.`);
  };

  const handleToggleFeatured = async (opportunityId: string, currentFeatured: boolean) => {
    const newFeatured = !currentFeatured;
    try {
      await updateOpportunityFeaturedInFirestore(opportunityId, newFeatured);
    } catch (err) {
      console.warn('Firestore featured update fallback:', err);
    }
    const opp = opportunities.find((o) => o.id === opportunityId);
    if (opp) {
      opp.featured = newFeatured;
      saveOpportunity({
        ...opp,
        featured: newFeatured,
      } as any);
    }
    await reloadData();
    showToast(`Opportunity ${newFeatured ? 'marked as Featured' : 'unmarked from Featured'}.`);
  };

  const handleVerificationChange = (opportunityId: string, newVerif: AdminVerificationStatus) => {
    updateOpportunityVerificationStatus(opportunityId, newVerif);
    reloadData();
    showToast(`Updated verification status to ${newVerif}.`);
  };

  // Category Actions
  const handleSaveCategory = async (cat: Category) => {
    try {
      await saveCategoryToFirestore(cat);
    } catch (err) {
      console.warn('Firestore save category fallback:', err);
    }
    saveAdminCategory(cat);
    await reloadData();
    onOpportunityUpdated?.();
    showToast(`Category "${cat.name}" updated in database.`);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategoryFromFirestore(categoryId);
    } catch (err) {
      console.warn('Firestore delete category fallback:', err);
    }
    deleteAdminCategory(categoryId);
    await reloadData();
    onOpportunityUpdated?.();
    showToast('Category deleted from database.');
  };

  // User Actions
  const handleUpdateUserStatus = async (userId: string, status: AccountStatus) => {
    try {
      const fbStatus = status === 'Active' ? 'active' : status === 'Suspended' ? 'suspended' : 'pendingVerification';
      await updateUserAccountStatusFirestore(userId, fbStatus as any);
    } catch (e) {
      console.warn('Firestore update account status fallback:', e);
    }
    updateAdminUserStatus(userId, status);
    await reloadData();
    showToast(`User status updated to ${status}.`);
  };

  const handleUpdateUserRole = async (userId: string, role: 'user' | 'admin') => {
    try {
      await updateUserRoleFirestore(userId, role as any);
    } catch (e) {
      console.warn('Firestore update user role fallback:', e);
    }
    updateAdminUserRole(userId, role);
    await reloadData();
    showToast(`User role updated to ${role}.`);
  };

  // Navigation tabs config
  const incomingCount = getIncomingOpportunities().length;

  const navTabs = [
    {
      id: 'dashboard' as AdminTabId,
      label: 'Admin Overview',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      id: 'pipeline' as AdminTabId,
      label: 'Opportunity Pipeline',
      icon: GitBranch,
      badge: incomingCount > 0 ? incomingCount : undefined,
      badgeColor: 'bg-indigo-600 text-white',
    },
    {
      id: 'sources' as AdminTabId,
      label: 'Source Registry',
      icon: Globe,
      badge: undefined,
    },
    {
      id: 'opportunities' as AdminTabId,
      label: 'Opportunities Catalog',
      icon: Layers,
      badge: stats.totalOpportunities,
    },
    {
      id: 'add-opportunity' as AdminTabId,
      label: 'Add Opportunity',
      icon: PlusCircle,
      badge: undefined,
    },
    {
      id: 'review-queue' as AdminTabId,
      label: 'Moderation Queue',
      icon: Clock,
      badge: stats.pendingReviewOpportunities > 0 ? stats.pendingReviewOpportunities : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'categories' as AdminTabId,
      label: 'Categories',
      icon: Tag,
      badge: categories.length,
    },
    {
      id: 'users' as AdminTabId,
      label: 'Users Overview',
      icon: Users,
      badge: adminUsers.length,
    },
    {
      id: 'affiliates' as AdminTabId,
      label: 'Partner Offers & Affiliates',
      icon: Sparkles,
      badge: undefined,
    },
    {
      id: 'monetization' as AdminTabId,
      label: 'Monetization & Plans',
      icon: DollarSign,
      badge: undefined,
    },
  ];

  const pendingReviewList = opportunities.filter((o) => o.publicationStatus === 'Pending Review');

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Admin Header */}
      <AdminHeader
        stats={stats}
        currentUser={currentUser || FALLBACK_ADMIN_USER}
        onExitAdmin={() => onNavigate('dashboard')}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Admin Body Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full flex-1 flex flex-col md:flex-row gap-6">
        {/* Left Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-3 shadow-xs space-y-1">
            <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Admin Navigation
            </div>

            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  id={`admin-tab-btn-${tab.id}`}
                  onClick={() => {
                    if (tab.id === 'add-opportunity') {
                      setEditingOpportunity(null);
                    }
                    setActiveTab(tab.id);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>

                  {tab.badge !== undefined && (
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-indigo-700/80 text-white'
                          : tab.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Platform Security Advisory Box */}
          <div className="p-4 rounded-3xl bg-slate-900 text-slate-300 text-xs space-y-2 border border-slate-800 hidden md:block">
            <div className="flex items-center gap-1.5 font-bold text-amber-400">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Catalog Security Mode</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Only opportunities marked with publication status <strong className="text-emerald-400">Published</strong> are indexed in seeker search results.
            </p>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 min-w-0">
          {/* TAB 0: OPPORTUNITY PIPELINE (STEP 12) */}
          {activeTab === 'pipeline' && (
            <OpportunityPipelineSection
              currentUser={currentUser}
              onOpportunityPublishedToCatalog={reloadData}
            />
          )}

          {/* TAB: SOURCE REGISTRY (STEP 3) */}
          {activeTab === 'sources' && (
            <SourceRegistryManagement
              categories={categories}
              currentUser={currentUser || FALLBACK_ADMIN_USER}
            />
          )}

          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <AdminDashboardOverview
              stats={stats}
              recentOpportunities={opportunities}
              pendingReviewList={pendingReviewList}
              onSelectTab={(t) => setActiveTab(t)}
              onSelectOpportunity={(opp) => setPreviewOpportunity(opp)}
              onEditOpportunity={(opp) => {
                setEditingOpportunity(opp);
                setActiveTab('add-opportunity');
              }}
            />
          )}

          {/* TAB 2: OPPORTUNITIES TABLE */}
          {activeTab === 'opportunities' && (
            <OpportunityManagementTable
              opportunities={opportunities}
              categories={categories}
              onAddNew={() => {
                setEditingOpportunity(null);
                setActiveTab('add-opportunity');
              }}
              onView={(opp) => setPreviewOpportunity(opp)}
              onEdit={(opp) => {
                setEditingOpportunity(opp);
                setActiveTab('add-opportunity');
              }}
              onReview={(opp) => {
                setActiveTab('review-queue');
              }}
              onArchive={handleArchiveOpportunity}
              onDelete={handleDeleteOpportunity}
              onStatusChange={handleStatusChange}
              onVerificationChange={handleVerificationChange}
              onToggleVerified={handleToggleVerified}
              onToggleFeatured={handleToggleFeatured}
            />
          )}

          {/* TAB 3: ADD / EDIT OPPORTUNITY FORM */}
          {activeTab === 'add-opportunity' && (
            <AddEditOpportunityForm
              initialOpportunity={editingOpportunity}
              categories={categories}
              onSave={handleSaveOpportunity}
              onCancel={() => {
                setEditingOpportunity(null);
                setActiveTab('opportunities');
              }}
            />
          )}

          {/* TAB 4: MODERATION REVIEW QUEUE */}
          {activeTab === 'review-queue' && (
            <ModerationReviewQueue
              pendingOpportunities={pendingReviewList}
              onApproveAndPublish={handleApproveAndPublish}
              onRequestChanges={handleRequestChanges}
              onRejectArchive={handleRejectArchive}
              onInspect={(opp) => setPreviewOpportunity(opp)}
              onEdit={(opp) => {
                setEditingOpportunity(opp);
                setActiveTab('add-opportunity');
              }}
            />
          )}

          {/* TAB 5: CATEGORY MANAGEMENT */}
          {activeTab === 'categories' && (
            <CategoryManagement
              categories={categories}
              opportunities={opportunities}
              onSaveCategory={handleSaveCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {/* TAB 6: USERS OVERVIEW */}
          {activeTab === 'users' && (
            <UserOverviewTable
              users={adminUsers}
              onUpdateStatus={handleUpdateUserStatus}
              onUpdateRole={handleUpdateUserRole}
            />
          )}

          {/* TAB 7: AFFILIATE & PARTNER OFFERS (STEP 16) */}
          {activeTab === 'affiliates' && (
            <AffiliateAdminManager />
          )}

          {/* TAB 8: MONETIZATION & PLANS CONSOLE (STEP 17) */}
          {activeTab === 'monetization' && (
            <AdminMonetizationSection />
          )}
        </main>
      </div>

      {/* Read-only Opportunity Inspection Preview Modal */}
      <OpportunityPreviewModal
        opportunity={previewOpportunity}
        isOpen={Boolean(previewOpportunity)}
        onClose={() => setPreviewOpportunity(null)}
        onEdit={(opp) => {
          setPreviewOpportunity(null);
          setEditingOpportunity(opp);
          setActiveTab('add-opportunity');
        }}
      />
    </div>
  );
};
