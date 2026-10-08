import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  RotateCcw,
  SlidersHorizontal,
  Tag
} from 'lucide-react';
import { AffiliateOffer, AffiliateUserContext, AffiliateMatchResult } from '../../types/affiliate';
import { evaluateAffiliateMatch } from '../../utils/affiliateMatchingEngine';

export interface AffiliateMatchPreviewProps {
  offers: AffiliateOffer[];
}

export const AffiliateMatchPreview: React.FC<AffiliateMatchPreviewProps> = ({ offers }) => {
  // Test scenario attributes
  const [country, setCountry] = useState<string>('United States');
  const [userType, setUserType] = useState<string>('Startup Founder');
  const [interest, setInterest] = useState<string>('Technology');
  const [fundingType, setFundingType] = useState<string>('Grant');
  const [businessStage, setBusinessStage] = useState<string>('Early Stage');
  const [industry, setIndustry] = useState<string>('Software');
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [includeInactive, setIncludeInactive] = useState<boolean>(true);

  // Preset scenarios for rapid admin testing
  const applyPreset = (presetName: string) => {
    if (presetName === 'startup') {
      setCountry('United States');
      setUserType('Startup Founder');
      setInterest('Technology');
      setFundingType('Grant');
      setBusinessStage('Early Stage');
      setIndustry('Software');
      setIsPremium(false);
    } else if (presetName === 'student') {
      setCountry('United Kingdom');
      setUserType('Student');
      setInterest('Education');
      setFundingType('Scholarship');
      setBusinessStage('Student');
      setIndustry('Academia');
      setIsPremium(false);
    } else if (presetName === 'ngo') {
      setCountry('Kenya');
      setUserType('Nonprofit Director');
      setInterest('Social Impact');
      setFundingType('NGO & Non-Profit');
      setBusinessStage('Growth');
      setIndustry('Nonprofit');
      setIsPremium(false);
    } else if (presetName === 'researcher') {
      setCountry('Germany');
      setUserType('Researcher');
      setInterest('Science');
      setFundingType('Research Grant');
      setBusinessStage('Growth');
      setIndustry('Biotech');
      setIsPremium(true);
    }
  };

  // Build context and run evaluation
  const evaluationResults: AffiliateMatchResult[] = useMemo(() => {
    const context: AffiliateUserContext = {
      country,
      userType,
      interests: [interest],
      fundingType,
      fundingPreferences: [fundingType],
      opportunityCategory: interest,
      businessStage,
      industry,
      isPremium
    };

    return offers.map((offer) =>
      evaluateAffiliateMatch(offer, context, {
        ignoreStatus: includeInactive,
        ignoreDates: false
      })
    ).sort((a, b) => {
      // Qualified first, then by score descending, then priority
      if (a.isQualified !== b.isQualified) return a.isQualified ? -1 : 1;
      if (b.score !== a.score) return b.score - a.score;
      return b.offer.priority - a.offer.priority;
    });
  }, [offers, country, userType, interest, fundingType, businessStage, industry, isPremium, includeInactive]);

  const qualifiedCount = evaluationResults.filter((r) => r.isQualified).length;

  return (
    <div className="space-y-6">
      {/* Simulation Controls Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Affiliate Matching Simulator
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure sample user traits to inspect deterministic scoring, targeting satisfaction, and qualification explanations.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset('startup')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Tech Startup
            </button>
            <button
              type="button"
              onClick={() => applyPreset('student')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/60 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Scholarship Student
            </button>
            <button
              type="button"
              onClick={() => applyPreset('ngo')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/60 dark:hover:text-rose-400 text-slate-700 dark:text-slate-300 transition-colors"
            >
              NGO Leader
            </button>
            <button
              type="button"
              onClick={() => applyPreset('researcher')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Researcher (Premium)
            </button>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* User Type */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              User / Applicant Type
            </label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="Startup Founder">Startup Founder</option>
              <option value="Small Business Owner">Small Business Owner</option>
              <option value="Researcher">Researcher / Academic</option>
              <option value="Nonprofit Director">Nonprofit Director</option>
              <option value="Student">Student / Postgraduate</option>
              <option value="Social Entrepreneur">Social Entrepreneur</option>
            </select>
          </div>

          {/* Funding Type */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Funding Type
            </label>
            <select
              value={fundingType}
              onChange={(e) => setFundingType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="Grant">Grant</option>
              <option value="Business Funding">Business Funding</option>
              <option value="Scholarship">Scholarship</option>
              <option value="Fellowship">Fellowship</option>
              <option value="NGO & Non-Profit">NGO & Non-Profit</option>
              <option value="Research Grant">Research Grant</option>
              <option value="Competition">Competition</option>
            </select>
          </div>

          {/* Primary Interest / Category */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Interest / Category
            </label>
            <select
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="Technology">Technology</option>
              <option value="Business">Business</option>
              <option value="Education">Education</option>
              <option value="Social Impact">Social Impact</option>
              <option value="CleanTech">CleanTech & Climate</option>
              <option value="Healthcare">Healthcare & Biotech</option>
            </select>
          </div>

          {/* Business Stage */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Business / Project Stage
            </label>
            <select
              value={businessStage}
              onChange={(e) => setBusinessStage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="Ideation">Ideation</option>
              <option value="Early Stage">Early Stage</option>
              <option value="Growth">Growth</option>
              <option value="Established">Established</option>
              <option value="Student">Student</option>
            </select>
          </div>

          {/* Country */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Country
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. United States, Germany, Kenya"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Industry */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Industry
            </label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Software, DeepTech, Nonprofit"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300 font-medium">
              <input
                type="checkbox"
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span>Simulate as FundEcho Premium Subscriber</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300 font-medium">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span>Evaluate Inactive / Draft Offers in Preview</span>
            </label>
          </div>

          <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
            <span className="text-indigo-600 dark:text-indigo-400">{qualifiedCount}</span> of {evaluationResults.length} offers qualify
          </div>
        </div>
      </div>

      {/* Matching Results List */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Evaluated Matching Offers ({evaluationResults.length})
        </h4>

        <div className="grid grid-cols-1 gap-3.5">
          {evaluationResults.map((result) => {
            const { offer, score, isQualified, reasons, disqualificationReasons } = result;

            return (
              <div
                key={offer.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isQualified
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                    : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/50 opacity-80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {offer.partnerName}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                        {offer.category}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Priority: {offer.priority} • Min Score: {offer.minimumMatchScore}%
                      </span>
                    </div>

                    <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {offer.title}
                    </h5>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {offer.description}
                    </p>
                  </div>

                  {/* Score & Status Pill */}
                  <div className="flex sm:flex-col items-end gap-1.5 shrink-0">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                        isQualified
                          ? score >= 80
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {isQualified ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      )}
                      <span>
                        Match: {score}% • {isQualified ? 'Qualified' : 'Disqualified'}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400">
                      Status: {offer.status}
                    </span>
                  </div>
                </div>

                {/* Signals / Reasons Accordion Details */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Positive reasons */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                      Positive Matching Signals ({reasons.length})
                    </span>
                    {reasons.length > 0 ? (
                      <ul className="space-y-0.5">
                        {reasons.map((r, i) => (
                          <li key={i} className="text-slate-600 dark:text-slate-300 flex items-start gap-1.5 text-[11px]">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No positive signals triggered.</span>
                    )}
                  </div>

                  {/* Disqualification or shortfall reasons */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      Targeting Filters & Constraints
                    </span>
                    {disqualificationReasons && disqualificationReasons.length > 0 ? (
                      <ul className="space-y-0.5">
                        {disqualificationReasons.map((dr, i) => (
                          <li key={i} className="text-rose-600 dark:text-rose-400 flex items-start gap-1.5 text-[11px]">
                            <span className="font-bold">•</span>
                            <span>{dr}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        All targeting requirements satisfied
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
