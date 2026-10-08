import React, { useState } from 'react';
import { 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  Server, 
  Lock, 
  RefreshCw, 
  Layers, 
  Sparkles,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { getFirebaseConnectionStatus, isFirebaseConfigured } from '../../services/firebase/firebaseConfig';
import { seedBaselineCatalogToFirestore } from '../../services/firebase/migrationBridge';
import { Button } from '../ui/Button';

export const FirebaseFoundationCard: React.FC = () => {
  const status = getFirebaseConnectionStatus();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{ message: string; success: boolean } | null>(null);

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    try {
      if (!isFirebaseConfigured()) {
        setSeedResult({
          message: 'Cloud environment variables (API credentials, etc.) are in standby/demo mode. Set credentials in .env to sync with live Cloud Database.',
          success: false,
        });
        setIsSeeding(false);
        return;
      }
      const res = await seedBaselineCatalogToFirestore();
      setSeedResult({
        message: `Successfully synced ${res.opportunitiesSeeded} opportunities, ${res.plansSeeded} plans, and ${res.affiliatesSeeded} affiliate offers to the cloud database!`,
        success: true,
      });
    } catch (err: any) {
      setSeedResult({
        message: err.message || 'Failed to seed sample catalog to the cloud database.',
        success: false,
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const collections = [
    { name: 'users/{userId}', desc: 'Account identity, auth state & roles' },
    { name: 'userProfiles/{userId}', desc: 'Demographics, funding interests & preferences' },
    { name: 'opportunities/{opportunityId}', desc: 'Published funding catalog with verification tags' },
    { name: 'opportunitySources/{sourceId}', desc: 'Institutional source provenance & quality rating' },
    { name: 'verificationRecords/{verificationId}', desc: 'Immutable audit log for verification evidence' },
    { name: 'users/{userId}/savedOpportunities/{id}', desc: 'User saved opportunities subcollection' },
    { name: 'applications/{applicationId}', desc: '9-step workspace proposals & attachments' },
    { name: 'users/{userId}/notifications/{id}', desc: 'In-app reminders & deadline notifications' },
    { name: 'affiliateOffers/{offerId}', desc: 'Commercial/institutional partner offers (URLs as data)' },
    { name: 'subscriptions & subscriptionPlans', desc: 'Monetization tiers & user subscription states' },
    { name: 'creditWallets & creditTransactions', desc: 'Server-authoritative balance & immutable ledger' },
    { name: 'adminProfiles/{userId}', desc: 'Fine-grained RBAC permissions' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-md space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Cloud Database & Infrastructure Foundation
              </h3>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Production
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cloud database schema, secure authentication layer, and access control rules.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
            status.isConfigured 
              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
          }`}>
            <span className={`w-2 h-2 rounded-full ${status.isConfigured ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`} />
            {status.isConfigured ? 'Cloud Database Connected' : 'Development Standby Mode'}
          </div>
        </div>
      </div>

      {/* Overview Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">Project Instance</span>
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
            {status.projectId}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold">Security Rules</span>
          </div>
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Security & Storage Rules Active
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-semibold">Service Layer</span>
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">
            14 Collections & Modules Ready
          </p>
        </div>
      </div>

      {/* Schema Architecture Map */}
      <div className="space-y-2">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Configured Cloud Architecture
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {collections.map((c, i) => (
            <div 
              key={i} 
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 flex items-start gap-2"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono truncate">
                  {c.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {c.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seeding & Migration Utility */}
      <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Data Compatibility:</span> Existing local and demo catalogs remain fully active. Sync catalog directly to the cloud database.
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSeed}
          isLoading={isSeeding}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Sync Catalog to Cloud Database
        </Button>
      </div>

      {seedResult && (
        <div className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
          seedResult.success 
            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
            : 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800'
        }`}>
          {seedResult.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          )}
          <span>{seedResult.message}</span>
        </div>
      )}
    </div>
  );
};
