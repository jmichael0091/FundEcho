import React from 'react';
import { 
  Globe, 
  ShieldCheck, 
  ArrowUpRight, 
  Mail, 
  Lock,
  Heart,
  CheckCircle2
} from 'lucide-react';
import { PageId } from '../../types';

export interface FooterProps {
  onNavigate: (page: PageId) => void;
  onSelectCategory?: (categorySlug: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onSelectCategory,
}) => {
  const currentYear = 2026;

  return (
    <footer className="w-full max-w-full overflow-x-clip bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Top Value Banner */}
      <div className="border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-slate-800 text-indigo-400 shrink-0 border border-slate-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">100% Verified Opportunities</h4>
                <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                  Every grant, fellowship, and scholarship is rigorously vetted to prevent scam or paywall listings.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-slate-800 text-emerald-400 shrink-0 border border-slate-700">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Global Coverage in 140+ Countries</h4>
                <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                  Opportunities across North America, Europe, Africa, Asia-Pacific, Latin America, and beyond.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-slate-800 text-amber-400 shrink-0 border border-slate-700">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Zero Application Fees on FundEcho</h4>
                <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                  Access all discovery tools, deadline reminders, and links to official source applications completely free.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">
                <span className="text-lg tracking-tighter">F</span>
              </div>
              <div>
                <span className="font-bold text-xl text-white tracking-tight">FundEcho</span>
                <span className="block text-[10px] uppercase font-semibold text-indigo-400 tracking-wider">
                  Global Funding & Opportunity Network
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Discover funding. Unlock opportunity. FundEcho connects creators, scholars, founders, researchers, and NGOs with verified global capital.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                12,480+ Active Grants & Awards
              </span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-xs uppercase font-bold tracking-wider text-white mb-4">
              Explore Funding
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('opportunities')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  All Opportunities
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('recommended')}
                  className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium flex items-center gap-1.5"
                >
                  <span>Smart Matching (For You)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory('grants');
                    onNavigate('opportunities');
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Grants & Innovation
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory('scholarships');
                    onNavigate('opportunities');
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Scholarships & Tuition
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory('fellowships');
                    onNavigate('opportunities');
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Fellowships & Residencies
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory('competitions');
                    onNavigate('opportunities');
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Competitions & Prizes
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory('ngo-funding');
                    onNavigate('opportunities');
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  NGO & Community Funds
                </button>
              </li>
            </ul>
          </div>

          {/* Platform & About Column */}
          <div>
            <h3 className="text-xs uppercase font-bold tracking-wider text-white mb-4">
              Platform & Network
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('directory')}
                  className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Site Directory & Sitemap</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('funders')}
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 font-medium"
                >
                  <span>Institutional Funders</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('calendar')}
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 font-medium"
                >
                  <span>Funding Deadlines Calendar</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  About FundEcho
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Verification Standards
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Submit an Opportunity
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Institutional Partnerships
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Contact Support
                </button>
              </li>
              <li>
                <button
                  type="button"
                  id="footer-admin-link"
                  onClick={() => onNavigate('admin')}
                  className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Console</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Plans & Tools Column */}
          <div>
            <h3 className="text-xs uppercase font-bold tracking-wider text-white mb-4">
              Plans & Accelerators
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('pricing')}
                  className="text-indigo-400 hover:text-indigo-300 transition-colors font-semibold flex items-center gap-1.5"
                >
                  <span>FundEcho Premium</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('credits')}
                  className="text-amber-400 hover:text-amber-300 transition-colors font-medium flex items-center gap-1.5"
                >
                  <span>Credit Packs</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('pricing')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Free Forever Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Ethical Ad Standards
                </button>
              </li>
            </ul>
          </div>

          {/* Trust & Legal Column */}
          <div>
            <h3 className="text-xs uppercase font-bold tracking-wider text-white mb-4">
              Trust & Security
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li className="text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Anti-Scam Guarantee</span>
              </li>
              <li className="text-slate-400">
                <span>Free Access Principle</span>
              </li>
              <li className="text-slate-400">
                <span>Source-Verified Links</span>
              </li>
              <li className="text-slate-400">
                <span>Privacy & Ethics Policy</span>
              </li>
              <li className="text-slate-400">
                <span>Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-12 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} FundEcho Network. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Global Opportunity Exchange</span>
            <span>•</span>
            <span>Designed for Global Impact</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
