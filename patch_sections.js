import fs from 'fs';

const code = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

const replacement = `
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
          title="FUNDORA Verified"
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
`;

const newCode = code.replace(
  /\{\/\* 2\. CATEGORY SHORTCUTS \*\/\}[\s\S]*?\{\/\* 4\. HOW FUNDORA WORKS \*\/\}/,
  replacement + "\n      {/* 8. HOW FUNDORA WORKS */}"
);

fs.writeFileSync('src/pages/HomePage.tsx', newCode);
