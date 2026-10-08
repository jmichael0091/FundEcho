import React, { useState } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Globe2, 
  Search, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  Building2, 
  Layers, 
  Compass, 
  ExternalLink,
  DollarSign,
  Users,
  Filter
} from 'lucide-react';
import { Category, Opportunity, PageId, UserProfile } from '../types';
import { generateDiscoverySections } from '../utils/discoveryUtils';
import { MatchCard } from '../components/ui/MatchCard';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { SectionHeading } from '../components/ui/SectionHeading';
import { CategoryCard } from '../components/ui/CategoryCard';
import { OpportunityCard } from '../components/ui/OpportunityCard';
import { Badge } from '../components/ui/Badge';
import { Clock } from 'lucide-react';

export interface HomePageProps {
  userProfile?: UserProfile | null;
  categories: Category[];
  opportunities: Opportunity[];
  onNavigate: (page: PageId) => void;
  onSelectOpportunity: (opportunity: Opportunity) => void;
  onSelectCategory: (categorySlug: string) => void;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (opportunity: Opportunity) => void;
  onSearchSubmit: (searchTerm: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  userProfile,
  categories,
  opportunities,
  onNavigate,
  onSelectOpportunity,
  onSelectCategory,
  bookmarkedIds,
  onToggleBookmark,
  onSearchSubmit,
}) => {
  const [heroSearchQuery, setHeroSearchQuery] = useState('');
  const discovery = React.useMemo(() => generateDiscoverySections(userProfile, opportunities), [userProfile, opportunities]);

  const handleHeroSearch = (query: string) => {
    onSearchSubmit(query);
    onNavigate('opportunities');
  };

  

  return (
    <div className="w-full max-w-full overflow-x-clip space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative pt-8 sm:pt-14 pb-12 sm:pb-20 overflow-hidden w-full max-w-full">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            {/* Top Brand Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-2xs">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
              <span>FundEcho • Global Funding & Opportunity Network</span>
            </div>

            {/* Main Headline & Tagline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              Discover funding. <br className="hidden sm:inline" />
              <span className="text-indigo-600 dark:text-indigo-400">Unlock opportunity.</span>
            </h1>

            {/* Supporting Description */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Connect with thousands of verified grants, scholarships, fellowships, competitions, and institutional funding programs worldwide. Non-dilutive capital for visionaries, researchers, and builders.
            </p>

            {/* Main Search Bar Container */}
            <div className="pt-3 max-w-2xl mx-auto w-full">
              <SearchInput
                id="hero-search-input"
                value={heroSearchQuery}
                onChange={setHeroSearchQuery}
                onSubmit={handleHeroSearch}
                placeholder="Search grants, scholarships, fellowships, organizations..."
                size="lg"
                showSubmitButton
                submitButtonText="Search Funding"
              />

              {/* Popular quick searches */}
              <div className="pt-3 flex items-center justify-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium text-slate-400 dark:text-slate-500">Popular:</span>
                {[
                  'Non-Dilutive Grants',
                  'AI Ethics Fellowship',
                  'Clean Energy Prize',
                  'Erasmus Scholarship',
                  'Youth Community Fund',
                ].map((tag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleHeroSearch(tag)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100/90 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Key Metrics / Credibility Banner */}
          <div className="mt-12 sm:mt-16 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-lg shadow-slate-200/60 dark:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.42)] grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center max-w-4xl mx-auto">
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                $4.8B+
              </div>
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Funding Tracked
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                12,500+
              </div>
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Verified Opportunities
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                140+
              </div>
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Eligible Countries
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                100% Free
              </div>
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Zero Fees for Seekers
              </div>
            </div>
          </div>
        </div>
      </section>

      
      {/* 2. RECOMMENDED FOR YOU */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/70">
              <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Personalized Matches</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Recommended For You
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed mt-1">
              Top opportunities based on your profile, interests, and location.
            </p>
          </div>
        </div>

        {userProfile && (userProfile.interests?.length || userProfile.country || userProfile.industry) ? (
          discovery.recommended.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {discovery.recommended.map(({ opportunity, match }) => (
                <MatchCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  match={match}
                  onSelect={onSelectOpportunity}
                  isBookmarked={bookmarkedIds.has(opportunity.id)}
                  onToggleBookmark={onToggleBookmark}
                />
              ))}
            </div>
          ) : (
             <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700">
               <p className="text-slate-600 dark:text-slate-400">No strong matches found right now. Try expanding your profile interests or browse other categories.</p>
               <Button variant="outline" className="mt-4" onClick={() => onNavigate('opportunities')}>Browse All Funding</Button>
             </div>
          )
        ) : (
          <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl p-8 text-center border border-indigo-100 dark:border-indigo-800/50">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Unlock Personalized Recommendations</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Complete your profile with your location, industry, and funding needs to see opportunities specifically matched to you.
            </p>
            <Button variant="primary" onClick={() => onNavigate('profile')}>
              Complete Your Profile
            </Button>
          </div>
        )}
      </section>

      {/* 3. FEATURED OPPORTUNITIES */}
      {discovery.featured.length > 0 && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/70">
              <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              <span>Hand-Picked</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Featured Opportunities
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed mt-1">
              High-value awards, prestigious fellowships, and top-tier programs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {discovery.featured.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onSelect={onSelectOpportunity}
              isBookmarked={bookmarkedIds.has(opp.id)}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </div>
      </section>
      )}

      {/* 4. NEW OPPORTUNITIES */}
      {discovery.newOpportunities.length > 0 && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/40 py-12 sm:py-16 -mx-4 sm:mx-0 sm:rounded-3xl">
        <div className="px-4 sm:px-0">
          <SectionHeading
            badge="Just Added"
            badgeVariant="emerald"
            title="New Opportunities"
            subtitle="The latest funding programs verified and added to the network."
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('opportunities')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="hidden sm:flex text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
              >
                View All New
              </Button>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
            {discovery.newOpportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onSelect={onSelectOpportunity}
                isBookmarked={bookmarkedIds.has(opp.id)}
                onToggleBookmark={onToggleBookmark}
              />
            ))}
          </div>
        </div>
      </section>
      )}

      {/* 5. CLOSING SOON */}
      {discovery.closingSoon.length > 0 && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Urgent Deadlines"
          badgeVariant="amber"
          title="Closing Soon"
          subtitle="Don't miss out. These active opportunities are closing within the next few weeks."
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('opportunities')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="hidden sm:flex text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50"
            >
              View Approaching
            </Button>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {discovery.closingSoon.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onSelect={onSelectOpportunity}
              isBookmarked={bookmarkedIds.has(opp.id)}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </div>
      </section>
      )}

      {/* 6. VERIFIED OPPORTUNITIES */}
      {discovery.verified.length > 0 && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Trust & Safety"
          badgeVariant="sky"
          title="FundEcho Verified"
          subtitle="Opportunities that have passed our strict institutional verification process."
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('opportunities')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="hidden sm:flex text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/50"
            >
              View Verified
            </Button>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {discovery.verified.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onSelect={onSelectOpportunity}
              isBookmarked={bookmarkedIds.has(opp.id)}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </div>
      </section>
      )}

      {/* 7. CATEGORY SHORTCUTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Browse by Domain"
          badgeVariant="indigo"
          title="Explore Funding Categories"
          subtitle="Discover curated opportunities tailored to your discipline, organizational structure, or career stage."
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('directory')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="hidden sm:flex"
            >
              View All Categories
            </Button>
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
          {categories.slice(0, 8).map((category) => (
            <CategoryCard
              key={category.slug}
              category={category}
              onClick={() => onSelectCategory(category.slug)}
            />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => onNavigate('opportunities')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Browse All Active Opportunities
          </Button>
        </div>
      </section>

      {/* 8. HOW FUNDECHO WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-12 lg:p-16 border border-slate-800 relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mb-12">
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-400 block mb-2">
              The FundEcho Standard
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              How FundEcho Works
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 leading-relaxed">
              We eliminate the noise and fragmented application portals by providing a single, trustworthy global infrastructure for legitimate capital.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/90 shadow-lg shadow-black/20 hover:border-slate-600 transition-all space-y-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-500/30">
                01
              </div>
              <h3 className="font-bold text-white text-base">Curate & Verify</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Every listing is verified against official governmental, foundation, and corporate registries to prevent scam applications.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/90 shadow-lg shadow-black/20 hover:border-slate-600 transition-all space-y-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">
                02
              </div>
              <h3 className="font-bold text-white text-base">Search & Filter</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Filter by geographic eligibility, grant size, funding structure (equity-free, full tuition), and academic/startup discipline.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/90 shadow-lg shadow-black/20 hover:border-slate-600 transition-all space-y-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-500/30">
                03
              </div>
              <h3 className="font-bold text-white text-base">Track Deadlines</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Bookmark top programs, view countdown timers, and review transparent eligibility checklists before drafting proposals.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/90 shadow-lg shadow-black/20 hover:border-slate-600 transition-all space-y-3">
              <div className="h-10 w-10 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm border border-sky-500/30">
                04
              </div>
              <h3 className="font-bold text-white text-base">Apply to Source</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Follow direct, authoritative links straight to the official granting bodies without intermediary fees or gatekeepers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINAL CTA SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl p-8 sm:p-12 text-center text-white border border-indigo-800/60 shadow-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
            <Globe2 className="w-3.5 h-3.5" />
            <span>Join 180,000+ Opportunity Seekers Globally</span>
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to fund your next breakthrough?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Explore thousands of legitimate global grants, academic scholarships, and innovation prizes updated daily.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => onNavigate('opportunities')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Explore All Opportunities
            </Button>
            <Button
              variant="outline"
              size="lg"
              fullWidth
              className="bg-transparent text-white border-slate-700 hover:bg-slate-800 hover:text-white"
              onClick={() => onNavigate('about')}
            >
              Learn About FundEcho
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
