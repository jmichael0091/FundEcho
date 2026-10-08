import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Globe, 
  Check, 
  CheckCircle2, 
  Sliders, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Save
} from 'lucide-react';
import { UserProfile, PageId, OpportunityType } from '../types';
import { CATEGORIES_DATA } from '../data/categories';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { calculateProfileCompletionPercentage } from '../services/firebase/authService';

export interface ProfilePageProps {
  user: UserProfile;
  onNavigate: (page: PageId) => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

const REGIONS_LIST = [
  'Global',
  'North America',
  'Europe',
  'Africa',
  'Asia-Pacific',
  'Latin America & Caribbean',
  'Middle East',
];

const USER_TYPES_LIST = [
  'Startup Founder',
  'Researcher / Academic',
  'Student / Scholar',
  'NGO & Social Enterprise',
  'Small Business Owner',
  'Creative & Artist',
  'General Seeker',
];

const BUSINESS_STAGES_LIST = [
  'Idea & Concept Stage',
  'Early Stage / Prototype',
  'Growth & Scaling',
  'Established Organization',
];

const COMMON_COUNTRIES = [
  'Global / Multi-regional',
  'United States',
  'United Kingdom',
  'Canada',
  'Germany',
  'Nigeria',
  'Kenya',
  'India',
  'Australia',
  'Singapore',
  'Brazil',
  'South Africa',
  'France',
  'Japan',
  'Netherlands',
];

const FUNDING_TYPES_LIST: OpportunityType[] = [
  'Grant',
  'Scholarship',
  'Fellowship',
  'Business Funding',
  'Research Grant',
  'NGO & Non-Profit',
  'Competition',
];

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  onNavigate,
  onUpdateUser,
}) => {
  const { updateProfile } = useAuth();
  const [name, setName] = useState(user.name);
  const [country, setCountry] = useState(user.country || 'Global / Multi-regional');
  const [region, setRegion] = useState(user.region || 'Global');
  const [userType, setUserType] = useState(user.userType || 'Startup Founder');
  const [businessStage, setBusinessStage] = useState(user.businessStage || 'Early Stage / Prototype');
  const [age, setAge] = useState<string>(user.age?.toString() || '');
  const [gender, setGender] = useState(user.gender || '');
  const [educationLevel, setEducationLevel] = useState(user.educationLevel || '');
  const [organizationName, setOrganizationName] = useState(user.organizationName || '');
  const [industry, setIndustry] = useState(user.industry || '');
  const [interests, setInterests] = useState<string[]>(user.interests || []);
  const [preferredFundingTypes, setPreferredFundingTypes] = useState<OpportunityType[]>(
    user.preferredFundingTypes || ['Grant', 'Business Funding']
  );
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const toggleInterest = (slug: string) => {
    setInterests((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const toggleFundingType = (type: OpportunityType) => {
    setPreferredFundingTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updated = await updateProfile({
        name,
        country,
        region,
        userType,
        businessStage,
        organizationName,
        industry,
        interests,
        preferredFundingTypes,
      });

      setIsSaving(false);
      if (updated) {
        onUpdateUser(updated);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      setIsSaving(false);
    }
  };

  const completionPercentage = calculateProfileCompletionPercentage({
    name,
    country,
    region,
    userType,
    businessStage,
    organizationName,
    interests,
    preferredFundingTypes,
  });

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
          <span className="text-slate-900 dark:text-white">Profile & Preferences</span>
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
        {/* Header summary */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-md shadow-slate-200/40 dark:shadow-[0_20px_35px_-5px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`h-16 w-16 rounded-2xl ${user.avatarBg || 'bg-indigo-600'} text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0`}>
              {user.initials || 'UN'}
            </div>
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {name || 'Opportunity Seeker'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user.email} • Member since {user.createdAt || '2025'}
              </p>
            </div>
          </div>

          {/* Profile completion meter badge */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shrink-0 text-right space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Profile Status:</span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{completionPercentage}% Complete</span>
            </div>
            <div className="w-36 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Save Success Banner */}
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm text-emerald-800 dark:text-emerald-200 flex items-center gap-3 animate-in fade-in duration-150">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">Profile and opportunity discovery preferences saved successfully!</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-md shadow-slate-200/40 dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Personal Information
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Update your identification details and regional location.
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 pl-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Email (Read Only Demo) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Email Address
              </label>
              <span className="text-[10px] uppercase font-bold text-slate-400">Primary Login</span>
            </div>
            <div className="relative">
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 pl-10 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
              <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Country & Region Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Primary Country
              </label>
              <div className="relative">
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 pl-10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {COMMON_COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <Globe className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Geographic Region
              </label>
              <div className="relative">
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 pl-10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {REGIONS_LIST.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <Globe className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Seeker Profile & Project Information */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Seeker Profile & Venture Details
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Helps FundEcho match relevant grants, fellowships, and investor programs to your stage.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Organization / Project Name
                </label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="e.g. Apex BioTech / TerraInitiative"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Industry / Focus Sector
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Clean Energy, AgriTech, AI & Robotics"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Seeker Role / Profile Type
                </label>
                <select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {USER_TYPES_LIST.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Venture / Project Stage
                </label>
                <select
                  value={businessStage}
                  onChange={(e) => setBusinessStage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {BUSINESS_STAGES_LIST.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Discovery Preferences */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Opportunity Discovery Preferences
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select your focus industries and preferred funding types.
              </p>
            </div>

            {/* Interest categories chips */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Categories of Interest
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES_DATA.map((cat) => {
                  const isSelected = interests.includes(cat.slug);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleInterest(cat.slug)}
                      className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Funding types */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Preferred Funding Types
              </label>
              <div className="flex flex-wrap gap-2">
                {FUNDING_TYPES_LIST.map((type) => {
                  const isSelected = preferredFundingTypes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleFundingType(type)}
                      className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Account Security & Cloud Identity Details */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Cloud Account Security & Authentication
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                {user.accountStatus || 'Active'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Authoritative UID</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 select-all break-all">
                  {user.id || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Account Role & Tier</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                  {user.role || 'Seeker'} • {user.tier || 'free'} plan
                </span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Changes are immediately applied to your session.
            </span>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
