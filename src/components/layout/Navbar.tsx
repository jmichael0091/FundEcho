import React, { useState, useRef, useEffect } from 'react';
import { 
  Globe, 
  Menu, 
  X, 
  Search, 
  Compass, 
  Info, 
  Mail, 
  Bookmark, 
  ArrowRight, 
  ShieldCheck, 
  Sun, 
  Moon,
  User,
  LayoutDashboard,
  Sliders,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  Bell,
  Calendar,
  Building2,
  Zap,
  Coins
} from 'lucide-react';
import { PageId, Theme, UserProfile } from '../../types';
import { Button } from '../ui/Button';
import { useMonetization } from '../../context/MonetizationContext';

export interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  savedCount?: number;
  onOpenSaved?: () => void;
  unreadNotificationCount?: number;
  onOpenNotificationCenter?: () => void;
  theme?: Theme;
  onToggleTheme?: () => void;
  user?: UserProfile | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  savedCount = 0,
  onOpenSaved,
  unreadNotificationCount = 0,
  onOpenNotificationCenter,
  theme = 'light',
  onToggleTheme,
  user = null,
  onLogout,
}) => {
  const { isPremium, credits } = useMonetization();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdminUser = Boolean(
    user && (
      user.role === 'admin' ||
      user.role === 'superAdmin' ||
      user.email === 'jmichrepublic@gmail.com' ||
      user.email === 'admin@fundecho.org' ||
      user.email === 'admin@fundora.org'
    )
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks: { id: PageId; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Globe className="w-4 h-4" /> },
    { id: 'opportunities', label: 'Opportunities', icon: <Compass className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { id: 'funders', label: 'Funders', icon: <Building2 className="w-4 h-4" /> },
    { id: 'pricing', label: 'Pricing', icon: <Zap className="w-4 h-4 text-indigo-500" /> },
    { id: 'directory', label: 'Directory', icon: <Search className="w-4 h-4" /> },
    ...(user ? [{ id: 'recommended' as PageId, label: 'For You', icon: <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> }] : []),
    { id: 'about', label: 'About', icon: <Info className="w-4 h-4" /> },
    { id: 'contact', label: 'Contact', icon: <Mail className="w-4 h-4" /> },
  ];

  const handleLinkClick = (pageId: PageId) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full max-w-full overflow-x-clip bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
      {/* Top micro-announcement banner */}
      <div className="bg-slate-950 text-white text-[11px] sm:text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 border-b border-slate-800/80 flex-wrap overflow-hidden">
        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold shrink-0">
          <ShieldCheck className="w-3.5 h-3.5" /> Verified Network
        </span>
        <span className="text-slate-500 hidden sm:inline">|</span>
        <span className="text-slate-300 truncate sm:overflow-visible sm:whitespace-normal max-w-full">
          Over $4.8B in verified grants, scholarships & global funding.
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleLinkClick('home')}
              className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1"
            >
              <img
                src="/logo.svg"
                alt="FundEcho Logo"
                className="h-9 w-9 sm:h-10 sm:w-10 object-contain shrink-0 group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight leading-none group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  FundEcho
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-0.5">
                  Global Opportunity Network
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  id={`nav-link-${link.id}`}
                  onClick={() => handleLinkClick(link.id)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 relative ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop Right CTA Actions & Theme Switch */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            {onToggleTheme && (
              <button
                type="button"
                id="theme-toggle-desktop"
                onClick={onToggleTheme}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-200/80 dark:border-slate-700/80 shadow-2xs"
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-200" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-600 animate-in spin-in-90 duration-200" />
                )}
              </button>
            )}

            {/* Notification Center Bell icon */}
            {onOpenNotificationCenter && (
              <button
                type="button"
                id="notifications-btn-desktop"
                onClick={onOpenNotificationCenter}
                className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200/80 dark:border-slate-700/80 shadow-2xs"
                title="Notifications & Deadline Alerts"
                aria-label="Open notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-pulse">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </button>
            )}

            {/* 3-Line Navigation Menu Icon after Notification Icon */}
            <button
              type="button"
              id="desktop-nav-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200/80 dark:border-slate-700/80 shadow-2xs"
              title={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* If Logged In: User Dropdown */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  id="user-profile-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-2xs group"
                >
                  <span className="text-xs font-bold text-slate-900 dark:text-white max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <div className={`h-7 w-7 rounded-lg ${user.avatarBg || 'bg-indigo-600'} text-white font-bold text-xs flex items-center justify-center shadow-2xs`}>
                    {user.initials || 'UN'}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          isPremium 
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' 
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {isPremium ? 'Premium' : 'Free'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => handleLinkClick('dashboard')}
                        className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-left transition-colors ${
                          currentPage === 'dashboard'
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        <span>Dashboard</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLinkClick('pricing')}
                        className={`w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-left transition-colors ${
                          currentPage === 'pricing'
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Zap className="w-4 h-4 text-amber-500" />
                          <span>Subscription Plan</span>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                          {isPremium ? 'Active' : 'Upgrade'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLinkClick('credits')}
                        className={`w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-left transition-colors ${
                          currentPage === 'credits'
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Coins className="w-4 h-4 text-amber-500" />
                          <span>Credit Balance</span>
                        </div>
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md">
                          {credits.balance}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLinkClick('recommended')}
                        className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-left transition-colors ${
                          currentPage === 'recommended'
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                        <span>Recommended for You</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLinkClick('saved')}
                        className={`w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-left transition-colors ${
                          currentPage === 'saved'
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Bookmark className="w-4 h-4 text-slate-400" />
                          <span>Saved Opportunities</span>
                        </div>
                        {savedCount > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                            {savedCount}
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLinkClick('calendar')}
                        className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-left transition-colors ${
                          currentPage === 'calendar'
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>Deadline Calendar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLinkClick('profile')}
                        className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-left transition-colors ${
                          currentPage === 'profile'
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Sliders className="w-4 h-4 text-slate-400" />
                        <span>Profile & Preferences</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLinkClick('settings')}
                        className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-left transition-colors ${
                          currentPage === 'settings'
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Account Settings</span>
                      </button>

                      {isAdminUser && (
                        <button
                          type="button"
                          id="user-dropdown-admin-btn"
                          onClick={() => handleLinkClick('admin')}
                          className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-left transition-colors ${
                            currentPage === 'admin'
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                              : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30'
                          }`}
                        >
                          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <span>Admin Console</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={handleLogoutClick}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Visitor Actions */
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="nav-login-btn"
                  onClick={() => handleLinkClick('login')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Log In
                </button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleLinkClick('signup')}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Right Controls: Theme Toggle + Menu Button */}
          <div className="flex items-center gap-1.5 md:hidden">
            {onToggleTheme && (
              <button
                type="button"
                id="theme-toggle-mobile"
                onClick={onToggleTheme}
                className="p-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700"
                aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-600" />
                )}
              </button>
            )}

            {/* Notification Center Bell icon on mobile */}
            {onOpenNotificationCenter && (
              <button
                type="button"
                id="notifications-btn-mobile"
                onClick={onOpenNotificationCenter}
                className="relative p-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700"
                aria-label="Open notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </button>
            )}

            {/* 3-Line Navigation Menu Icon after Notification Icon on Mobile */}
            <button
              type="button"
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Dropdown Menu (Accessible via 3-line icon on all screens) */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 lg:px-8 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <div className="max-w-7xl mx-auto space-y-4">
            {/* User Profile Card if logged in */}
            {user ? (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl ${user.avatarBg || 'bg-indigo-600'} text-white font-bold text-sm flex items-center justify-center shadow-xs`}>
                    {user.initials || 'UN'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => handleLinkClick('dashboard')}
                    className="px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 text-center truncate"
                  >
                    Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLinkClick('recommended')}
                    className="px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-indigo-600 dark:text-indigo-400 text-center truncate"
                  >
                    For You
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLinkClick('saved')}
                    className="px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 text-center truncate"
                  >
                    Saved ({savedCount})
                  </button>
                </div>
              </div>
            ) : null}

            {/* Navigation links grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2">
              {navLinks.map((link) => {
                const isActive = currentPage === link.id;
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => handleLinkClick(link.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <span className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}>
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                  </button>
                );
              })}

              {user && (
                <>
                  <button
                    type="button"
                    onClick={() => handleLinkClick('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${
                      currentPage === 'profile'
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <Sliders className="w-4 h-4 text-slate-400" />
                    <span>Profile & Preferences</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLinkClick('settings')}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${
                      currentPage === 'settings'
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Account Settings</span>
                  </button>

                  {isAdminUser && (
                    <button
                      type="button"
                      id="mobile-nav-admin-btn"
                      onClick={() => handleLinkClick('admin')}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${
                        currentPage === 'admin'
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                          : 'text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Admin Console</span>
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Bottom Action Area */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              {user ? (
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2 max-w-sm">
                  <Button
                    variant="outline"
                    size="md"
                    fullWidth
                    onClick={() => handleLinkClick('login')}
                  >
                    Log In
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={() => handleLinkClick('signup')}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

