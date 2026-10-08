import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Sparkles,
  ArrowLeft,
  Check
} from 'lucide-react';
import { PageId, UserProfile, OpportunityType } from '../types';
import { CATEGORIES_DATA } from '../data/categories';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export interface SignUpPageProps {
  onNavigate: (page: PageId) => void;
  onSignUpSuccess: (user: UserProfile) => void;
  pendingSaveTitle?: string;
}

const FUNDING_TYPES_LIST: OpportunityType[] = [
  'Grant',
  'Scholarship',
  'Fellowship',
  'Business Funding',
  'Research Grant',
  'NGO & Non-Profit',
  'Competition',
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

export const SignUpPage: React.FC<SignUpPageProps> = ({
  onNavigate,
  onSignUpSuccess,
  pendingSaveTitle,
}) => {
  const { register, signInWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('Global / Multi-regional');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'entrepreneurship-business',
    'technology-innovation',
  ]);
  const [selectedFundingTypes, setSelectedFundingTypes] = useState<OpportunityType[]>([
    'Grant',
    'Business Funding',
  ]);
  const [rememberSession, setRememberSession] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleInterest = (slug: string) => {
    setSelectedInterests((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const toggleFundingType = (type: OpportunityType) => {
    setSelectedFundingTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Please agree to the terms to create your account.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await register({
        name,
        email,
        password,
        country,
        interests: selectedInterests,
        preferredFundingTypes: selectedFundingTypes,
        rememberSession,
      });
      if (res.success && res.user) {
        onSignUpSuccess(res.user);
      } else {
        setErrorMessage(res.error || 'Failed to create account.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await signInWithGoogle();
      if (res.success && res.user) {
        onSignUpSuccess(res.user);
      } else {
        setErrorMessage(res.error || 'Could not sign up with Google.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google sign up failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 overflow-x-clip">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Back navigation */}
        <button
          type="button"
          onClick={() => onNavigate('opportunities')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Opportunities</span>
        </button>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 lg:p-10 shadow-xl shadow-slate-200/50 dark:shadow-[0_20px_35px_-5px_rgba(0,0,0,0.5)] space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="h-12 w-12 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-black mx-auto shadow-md shadow-indigo-600/20">
              <span className="text-xl">F</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Create your free account
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Join FundEcho to bookmark opportunities, customize your funding preferences, and track upcoming deadlines.
            </p>
          </div>

          {/* Pending Save Banner */}
          {pendingSaveTitle && (
            <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-300 flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>Create account to save <strong>{pendingSaveTitle}</strong></span>
            </div>
          )}

          {/* Google Sign-Up */}
          <div>
            <Button
              type="button"
              variant="outline"
              size="lg"
              fullWidth
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              className="flex items-center justify-center gap-2.5 font-bold border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign Up with Google</span>
            </Button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative px-3 bg-white dark:bg-slate-900 text-xs text-slate-400">
              Or register with email
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 pl-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 pl-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Country */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Primary Country / Region *
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

            {/* Passwords grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 pl-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Confirm Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-semibold"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 pl-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Optional Opportunity Preferences */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Select Your Areas of Interest (Optional)
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  We'll customize your dashboard recommendations based on your selections.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {CATEGORIES_DATA.map((cat) => {
                  const isSelected = selectedInterests.includes(cat.slug);
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

            {/* Preferred Funding Types */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Preferred Funding Types
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select the types of support you are actively seeking.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {FUNDING_TYPES_LIST.map((type) => {
                  const isSelected = selectedFundingTypes.includes(type);
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

            {/* Checkboxes: Remember & Agree */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberSession}
                  onChange={(e) => setRememberSession(e.target.checked)}
                  className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Remember my session on this device
                </span>
              </label>

              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 mt-0.5"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                  I agree to the FundEcho Terms of Service & Privacy Guidelines. (100% Free).
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isLoading ? 'Creating Account...' : 'Complete Sign Up'}
            </Button>
          </form>

          {/* Footer Navigation */}
          <div className="pt-2 text-center text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
            <span>Already have an account? </span>
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Log in instead
            </button>
          </div>
        </div>

        {/* Trust badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Enterprise Cloud Security & Privacy • Safe & Open for Opportunity Seekers</span>
        </div>
      </div>
    </div>
  );
};
