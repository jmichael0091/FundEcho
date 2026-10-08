import React from 'react';
import { 
  ShieldCheck, 
  Globe2, 
  Target, 
  Zap, 
  CheckCircle2, 
  Lock, 
  HeartHandshake, 
  Award, 
  Users, 
  ArrowRight,
  Sparkles,
  Building2
} from 'lucide-react';
import { PageId } from '../types';
import { Button } from '../components/ui/Button';
import { SectionHeading } from '../components/ui/SectionHeading';

export interface AboutPageProps {
  onNavigate: (page: PageId) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 sm:space-y-20 overflow-x-clip">
      {/* 1. Header Hero */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xs">
          <Globe2 className="w-3.5 h-3.5" />
          <span>About FundEcho</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Democratizing access to global capital & human opportunity.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          FundEcho is the international funding network built to bridge brilliant minds, impactful founders, scientists, and non-profits with legitimate institutional grants, scholarships, and fellowships.
        </p>
      </div>

      {/* 2. Key Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-lg shadow-slate-200/60 dark:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.42)]">
        <div className="space-y-1">
          <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">$4.8B+</div>
          <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">Capital Tracked</div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Across non-dilutive awards and institutional endowments.</p>
        </div>

        <div className="space-y-1">
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">140+</div>
          <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">Countries Represented</div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Connecting global applicants with borderless opportunities.</p>
        </div>

        <div className="space-y-1">
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">100%</div>
          <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">Verified Listings</div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Rigorously audited by editorial staff before publication.</p>
        </div>

        <div className="space-y-1">
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">180K+</div>
          <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">Active Seekers</div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Researchers, founders, creators, and civic organizers.</p>
        </div>
      </div>

      {/* 3. The FundEcho Verification Standard */}
      <section className="space-y-6">
        <SectionHeading
          badge="Trust & Authenticity"
          badgeVariant="emerald"
          title="The FundEcho Verification Standard"
          subtitle="How we protect applicants from predatory services, paywalls, and counterfeit grant directories."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md shadow-slate-200/60 dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.36)] hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-[0_20px_35px_-5px_rgba(99,102,241,0.12)] hover:-translate-y-1 transition-all space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/60">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Primary Source Validation</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Every opportunity is linked directly to official foundation charters, governmental gazettes, university domains, or corporate philanthropic registries.
            </p>
          </div>

          <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md shadow-slate-200/60 dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.36)] hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-[0_20px_35px_-5px_rgba(99,102,241,0.12)] hover:-translate-y-1 transition-all space-y-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/60">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Zero Paywall Policy</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              We never charge candidates or non-profits fees to discover opportunities or access direct application links. Access to legitimate funding should be universally open.
            </p>
          </div>

          <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md shadow-slate-200/60 dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.36)] hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-[0_20px_35px_-5px_rgba(99,102,241,0.12)] hover:-translate-y-1 transition-all space-y-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-800/60">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Deadline Monitoring</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Our automated crawlers and human verification team regularly audit closing dates to remove expired listings and maintain high data freshness.
            </p>
          </div>
        </div>
      </section>

      {/* 4. The FundEcho Manifesto / Core Principles */}
      <section className="bg-slate-900 text-white rounded-2xl p-8 sm:p-12 border border-slate-800 shadow-xl dark:shadow-[0_20px_40px_rgba(0,0,0,0.48)] space-y-8">
        <div className="max-w-2xl">
          <span className="text-xs uppercase font-bold tracking-wider text-indigo-400 block mb-2">
            Our Core Principles
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            The FundEcho Manifesto
          </h2>
          <p className="text-slate-400 text-sm mt-1 leading-relaxed">
            Four pillars that govern every architectural and editorial decision at FundEcho.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-4 p-5 sm:p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-lg shadow-black/20">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0 font-mono text-sm font-bold">
              01
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-base">Talent is Global, Opportunity is Fragmented</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Billions of dollars in non-dilutive capital go unawarded each year because worthy candidates never discover the calls for proposals in time. We unify fragmented channels.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 sm:p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-lg shadow-black/20">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 font-mono text-sm font-bold">
              02
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-base">Non-Dilutive Capital First</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                We champion grants, fellowships, and equity-free prizes that allow innovators to maintain ownership, independence, and scientific integrity.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 sm:p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-lg shadow-black/20">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 font-mono text-sm font-bold">
              03
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-base">Transparent Requirements</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                No hidden caveats. We break down complex 50-page RFP legal documents into clear eligibility criteria and actionable submission checklists.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 sm:p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-lg shadow-black/20">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 shrink-0 font-mono text-sm font-bold">
              04
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-base">Equal Visibility for All Regions</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                We spotlight opportunities tailored for underrepresented geographies across the Global South alongside North American and European initiatives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA Row */}
      <div className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl p-8 sm:p-10 shadow-lg shadow-indigo-100/60 dark:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.42)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Are you a grantmaker, university, or foundation?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Publish your grant or fellowship directly to our network of qualified global applicants.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
          <Button
            variant="primary"
            size="md"
            className="w-full md:w-auto"
            onClick={() => onNavigate('contact')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Submit an Opportunity
          </Button>
        </div>
      </div>
    </div>
  );
};
