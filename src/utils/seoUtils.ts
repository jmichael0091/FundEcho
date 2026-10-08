import { Opportunity, Category, OpportunityType, OpportunityRegion } from '../types';
import { BreadcrumbItem, CountryInfo, FundingTypeInfo, SEOMetaData, SitemapEntry } from '../types/seo';

/**
 * Base site URL configuration
 */
export const SITE_NAME = 'FundEcho';
export const SITE_TAGLINE = 'The Global Funding & Opportunity Network';
export const SITE_DESCRIPTION = 'Discover verified grants, scholarships, fellowships, competitions, and institutional funding worldwide with zero application fees.';
export const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&h=630&q=80';

/**
 * Helper to get active site origin safely (browser or fallback)
 */
export function getSiteOrigin(): string {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }
  return 'https://fundecho.network';
}

/**
 * Clean slugify string
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

/**
 * Supported Country / Geographic SEO Hubs with curated location profiles
 */
export const COUNTRY_SEO_PROFILES: CountryInfo[] = [
  {
    name: 'Nigeria',
    slug: 'nigeria',
    code: 'NG',
    flag: '🇳🇬',
    region: 'Africa',
    summary: 'Discover verified grants, tech founder funding, academic scholarships, and NGO support tailored for applicants and organizations operating across Nigeria.',
    currency: 'NGN / USD',
    popularCategories: ['Business & Startup Funding', 'Grants & Innovation', 'Scholarships', 'NGO & Non-Profit'],
    keyHighlights: [
      'High concentration of fintech, agritech, and climate innovation grants',
      'International postgraduate scholarships (Chevening, Commonwealth, DAAD)',
      'Civic society and health development donor programs'
    ],
    applicantTips: [
      'Ensure CAC business registration or NGO incorporation certificate is ready',
      'Highlight localized socio-economic impact across West Africa',
      'Demonstrate scalable unit economics or clear community reach metrics'
    ]
  },
  {
    name: 'Ghana',
    slug: 'ghana',
    code: 'GH',
    flag: '🇬🇭',
    region: 'Africa',
    summary: 'Explore non-dilutive capital, youth entrepreneurship awards, academic bursaries, and sustainability grants accessible in Ghana.',
    currency: 'GHS / USD',
    popularCategories: ['Grants & Innovation', 'Climate & Sustainability', 'Scholarships', 'Business & Startup Funding'],
    keyHighlights: [
      'Pan-African innovation challenges and green growth accelerators',
      'University study grants and global academic exchange fellowships',
      'Agribusiness and renewable energy grant windows'
    ],
    applicantTips: [
      'Verify RGD business registration or tax compliance clearance',
      'Articulate clear job creation and gender-inclusion outcomes',
      'Maintain verifiable project expenditure accounting'
    ]
  },
  {
    name: 'Kenya',
    slug: 'kenya',
    code: 'KE',
    flag: '🇰🇪',
    region: 'Africa',
    summary: 'Access East Africa’s premier innovation funds, scientific research fellowships, agricultural technology grants, and social enterprise capital in Kenya.',
    currency: 'KES / USD',
    popularCategories: ['Business & Startup Funding', 'Research Grants', 'Grants & Innovation', 'Climate & Sustainability'],
    keyHighlights: [
      'Silicon Savannah tech accelerators and digital inclusion grants',
      'Global climate resilience and conservation donor funding',
      'East African community health and education programs'
    ],
    applicantTips: [
      'Prepare KRA tax compliance and registered entity documentation',
      'Demonstrate pilot traction or field trial metrics in East Africa',
      'Emphasize technological accessibility and mobile-first enablement'
    ]
  },
  {
    name: 'South Africa',
    slug: 'south-africa',
    code: 'ZA',
    flag: '🇿🇦',
    region: 'Africa',
    summary: 'Find institutional grants, scientific research fellowships, SME development funds, and arts residencies across South Africa.',
    currency: 'ZAR / USD',
    popularCategories: ['Research Grants', 'Business & Startup Funding', 'Fellowships', 'Scholarships'],
    keyHighlights: [
      'Substantial STEM research funding and doctoral fellowship cohorts',
      'B-BBEE compliant youth enterprise and industrial innovation awards',
      'Cultural arts foundations and community development initiatives'
    ],
    applicantTips: [
      'Ensure CIPC registration and Tax Pin verification are active',
      'Detail institutional partnerships or university affiliations for research grants',
      'Provide audited financials or verified bank statements for larger grants'
    ]
  },
  {
    name: 'United States',
    slug: 'united-states',
    code: 'US',
    flag: '🇺🇸',
    region: 'North America',
    summary: 'Browse non-dilutive federal grants, foundational prizes, university scholarships, startup accelerators, and research awards for US entities and international collaborations.',
    currency: 'USD',
    popularCategories: ['Grants & Innovation', 'Research Grants', 'Business & Startup Funding', 'Scholarships'],
    keyHighlights: [
      'Federal innovation programs (SBIR/STTR equivalents) and foundational grants',
      'Leading university graduate fellowships and merit scholarships',
      'Private foundation endowments and civic impact challenges'
    ],
    applicantTips: [
      'Maintain SAM.gov or EIN entity documentation where applicable',
      'Follow grant review rubric criteria and strict page length constraints',
      'Include rigorous evaluation methodologies and milestone measurement plans'
    ]
  },
  {
    name: 'United Kingdom',
    slug: 'united-kingdom',
    code: 'GB',
    flag: '🇬🇧',
    region: 'Europe',
    summary: 'Discover UK-eligible innovation funding, academic research grants, charitable trust donations, and prestigious international fellowships.',
    currency: 'GBP / USD',
    popularCategories: ['Fellowships', 'Scholarships', 'Research Grants', 'Grants & Innovation'],
    keyHighlights: [
      'World-renowned postgraduate fellowships (Chevening, Rhodes, Wellcome Trust)',
      'Innovate UK competition grants and industrial challenge funds',
      'Charity Commission registered non-profit donor initiatives'
    ],
    applicantTips: [
      'Verify Companies House or UK Charity registration if applying as an organization',
      'Highlight cross-border collaboration and knowledge transfer',
      'Clearly delineate project risks and intellectual property management'
    ]
  },
  {
    name: 'Canada',
    slug: 'canada',
    code: 'CA',
    flag: '🇨🇦',
    region: 'North America',
    summary: 'Access Canadian public innovation funding, clean technology grants, graduate research awards, and global collaborative prizes.',
    currency: 'CAD / USD',
    popularCategories: ['Climate & Sustainability', 'Research Grants', 'Scholarships', 'Grants & Innovation'],
    keyHighlights: [
      'Clean technology and net-zero industrial grant initiatives',
      'Tri-council research fellowships and global university exchanges',
      'Indigenous and community empowerment development grants'
    ],
    applicantTips: [
      'Prepare CRA Business Number and regional incorporation details',
      'Align proposals with sustainable development and environmental metrics',
      'Ensure clear intellectual property ownership declarations'
    ]
  },
  {
    name: 'India',
    slug: 'india',
    code: 'IN',
    flag: '🇮🇳',
    region: 'Asia-Pacific',
    summary: 'Explore startup grant schemes, STEM fellowships, grassroots social innovation prizes, and international study scholarships in India.',
    currency: 'INR / USD',
    popularCategories: ['Business & Startup Funding', 'Grants & Innovation', 'Scholarships', 'Research Grants'],
    keyHighlights: [
      'DPIIT recognized startup seed funds and tech challenge awards',
      'National science fellowships and international university scholarships',
      'CSR foundation grants for rural education, healthcare, and water security'
    ],
    applicantTips: [
      'Have DPIIT certificate, MCA incorporation, or 80G/12A NGO documentation ready',
      'Demonstrate frugal innovation and wide-scale affordability',
      'Provide clear baseline assessment data for social impact projects'
    ]
  },
  {
    name: 'Germany',
    slug: 'germany',
    code: 'DE',
    flag: '🇩🇪',
    region: 'Europe',
    summary: 'Discover European research grants, DAAD academic scholarships, tech transfer grants, and green economy innovation awards based in or partnered with Germany.',
    currency: 'EUR / USD',
    popularCategories: ['Research Grants', 'Scholarships', 'Climate & Sustainability', 'Fellowships'],
    keyHighlights: [
      'DAAD international student and doctoral researcher scholarships',
      'Horizon Europe and German federal research and innovation funds',
      'Industrial decarbonization and advanced engineering grants'
    ],
    applicantTips: [
      'Ensure academic credentials and language proficiency certificates are verified',
      'Structure proposals with precise academic methodology and bibliography',
      'Highlight cross-European consortium and institution partnerships'
    ]
  },
  {
    name: 'Global & Remote',
    slug: 'global',
    code: 'GL',
    flag: '🌐',
    region: 'Global',
    summary: 'Discover boundary-free international funding opportunities, open-call global prizes, remote fellowships, and worldwide non-dilutive capital accessible to applicants anywhere.',
    currency: 'USD / Multi-currency',
    popularCategories: ['Grants & Innovation', 'Fellowships', 'Competitions & Prizes', 'Scholarships'],
    keyHighlights: [
      '100% open-call eligibility regardless of geographic citizenship',
      'Virtual residency programs and remote accelerator cohorts',
      'Global challenges addressing UN Sustainable Development Goals (SDGs)'
    ],
    applicantTips: [
      'Emphasize global scalability and cross-cultural applicability',
      'Provide English documentation or certified translations of credentials',
      'Highlight remote execution capability and international team experience'
    ]
  }
];

/**
 * Funding Types SEO Reference with rich metadata
 */
export const FUNDING_TYPE_SEO_PROFILES: FundingTypeInfo[] = [
  {
    type: 'Grant',
    name: 'Grants & Non-Dilutive Capital',
    slug: 'grants',
    heading: 'Grants & Non-Dilutive Funding Opportunities',
    tagline: 'Direct, equity-free financial capital to accelerate high-impact projects, innovations, and community solutions.',
    description: 'Grants represent non-repayable financial awards provided by governments, foundations, and corporations to support specific projects, innovative ideas, or social missions without requiring equity or debt repayment.',
    whoIsThisFor: 'Startups, researchers, non-profits, independent creators, and innovators looking to fund project milestones without giving up ownership.',
    avgAwardRange: '$5,000 – $500,000+',
    keyBenefits: [
      '100% Non-dilutive: Retain complete ownership and equity of your intellectual property',
      'Institutional validation and credibility from reputable grantmakers',
      'Direct capital to fund prototyping, pilot tests, and critical team payroll'
    ],
    typicalRequirements: [
      'Structured project proposal and milestone-based expenditure budget',
      'Proof of concept, prototype demonstration, or validated pilot evidence',
      'Clear evaluation metrics and public reporting commitments'
    ],
    icon: 'Sparkles',
    accentColor: 'indigo'
  },
  {
    type: 'Scholarship',
    name: 'Scholarships & Academic Awards',
    slug: 'scholarships',
    heading: 'Scholarships & Higher Education Funding Worldwide',
    tagline: 'Undergraduate, Master’s, PhD, and vocational academic awards to fund tuition, living costs, and research.',
    description: 'Scholarships provide merit-based or need-based financial aid to students and scholars pursuing formal education programs at accredited universities and institutions globally.',
    whoIsThisFor: 'Prospective and current undergraduate, master’s, doctoral, and postdoctoral students worldwide.',
    avgAwardRange: '$2,500 to Full Tuition & Living Stipends ($100,000+)',
    keyBenefits: [
      'Covers tuition fees, living allowances, books, and international travel',
      'Relieves student loan burden and accelerates academic career paths',
      'Access to global alumni networks and mentorship circles'
    ],
    typicalRequirements: [
      'Academic transcripts and minimum GPA / grade benchmarks',
      'Personal statement, statement of purpose, or essays',
      'Letters of academic or professional recommendation'
    ],
    icon: 'GraduationCap',
    accentColor: 'blue'
  },
  {
    type: 'Fellowship',
    name: 'Fellowships & Leadership Residencies',
    slug: 'fellowships',
    heading: 'Prestigious Fellowships, Residencies & Cohorts',
    tagline: 'Competitive stipends, global leadership retreats, and institutional residencies for top emerging leaders.',
    description: 'Fellowships are competitive, professional development awards designed to support emerging thought leaders, researchers, journalists, artists, and public servants with dedicated stipends and executive mentorship.',
    whoIsThisFor: 'Mid-career professionals, researchers, social activists, journalists, artists, and civic leaders.',
    avgAwardRange: '$25,000 – $120,000 Stipend + Travel',
    keyBenefits: [
      'Generous living stipend enabling full-time focus on leadership or research',
      'Membership in lifelong, prestigious global alumni networks',
      'Direct access to international policymakers, mentors, and industry executives'
    ],
    typicalRequirements: [
      'Demonstrated track record of leadership and community impact',
      'Detailed study or creative project proposal',
      'Professional references and structured interview rounds'
    ],
    icon: 'Award',
    accentColor: 'purple'
  },
  {
    type: 'NGO & Non-Profit',
    name: 'NGO & Non-Profit Development Grants',
    slug: 'ngo-funding',
    heading: 'NGO, Charitable & Community Development Grants',
    tagline: 'Institutional donor grants for civic organizations, grassroots initiatives, and humanitarian missions.',
    description: 'NGO and non-profit funding streams support legally registered charities, civil society organizations, and grassroots groups working on health, education, poverty alleviation, human rights, and environmental protection.',
    whoIsThisFor: 'Registered non-governmental organizations, charities, community-based organizations, and social enterprises.',
    avgAwardRange: '$10,000 – $250,000',
    keyBenefits: [
      'Institutional programmatic support and capacity-building resources',
      'Multi-year funding options for established grassroots initiatives',
      'Strengthens local community infrastructure and public health delivery'
    ],
    typicalRequirements: [
      'Official NGO registration certificates and tax-exempt documentation',
      'Audited financial records and proven governance structures',
      'Logical framework (logframe) with measurable community impact metrics'
    ],
    icon: 'HeartHandshake',
    accentColor: 'emerald'
  },
  {
    type: 'Business Funding',
    name: 'Business & Startup Funding',
    slug: 'business-funding',
    heading: 'Startup Grants, Equity-Free Accelerators & Seed Funds',
    tagline: 'Capital for early-stage founders, SMEs, and commercial innovations without predatory terms.',
    description: 'Business funding opportunities encompass equity-free accelerator grants, founder prizes, corporate innovation challenges, and public seed initiatives designed to help businesses scale commercially.',
    whoIsThisFor: 'Tech founders, small business owners, social entrepreneurs, and innovation teams.',
    avgAwardRange: '$15,000 – $200,000',
    keyBenefits: [
      'Non-dilutive or founder-friendly capital to extend runway',
      'Intensive accelerator mentorship and investor matchmaking',
      'Pilot customer introductions and enterprise partner access'
    ],
    typicalRequirements: [
      'Pitch deck and executive summary',
      'Demonstrated product-market fit or early customer traction',
      'Cap table and legal incorporation documents'
    ],
    icon: 'Building2',
    accentColor: 'sky'
  },
  {
    type: 'Competition',
    name: 'Competitions & Innovation Challenges',
    slug: 'competitions',
    heading: 'Global Hackathons, Pitch Prizes & Challenge Awards',
    tagline: 'High-visibility prize awards and global competitions rewarding the most inventive solutions.',
    description: 'Competitions and prize challenges invite teams to solve well-defined technical, business, or humanitarian challenges, rewarding the top-performing submissions with cash prizes and global recognition.',
    whoIsThisFor: 'Engineers, student teams, cross-disciplinary startups, and creative problem solvers.',
    avgAwardRange: '$5,000 – $100,000+ Grand Prize',
    keyBenefits: [
      'Rapid adjudication and immediate cash disbursement',
      'High media visibility and international branding opportunity',
      'Constructive feedback from expert judging panels'
    ],
    typicalRequirements: [
      'Submission of functioning prototype, pitch video, or project deliverable',
      'Adherence to competition theme and evaluation criteria',
      'Live pitch presentation or demonstration for shortlisted finalists'
    ],
    icon: 'Trophy',
    accentColor: 'amber'
  },
  {
    type: 'Research Grant',
    name: 'Scientific & Academic Research Grants',
    slug: 'research-grants',
    heading: 'Scientific Research, STEM & Academic Grants',
    tagline: 'Funding breakthrough scientific inquiry, medical trials, and academic discovery.',
    description: 'Research grants support faculty, postdocs, independent scientists, and laboratory groups conducting foundational or applied research across STEM, medicine, social sciences, and the humanities.',
    whoIsThisFor: 'Principal investigators, university researchers, clinical trial leads, and doctoral fellows.',
    avgAwardRange: '$20,000 – $500,000+',
    keyBenefits: [
      'Direct lab equipment, research assistant, and publication cost coverage',
      'Peer-reviewed prestige elevating scholarly reputations',
      'Enables high-risk, high-reward academic investigations'
    ],
    typicalRequirements: [
      'Rigorous research methodology with literature review and hypothesis',
      'Institutional Review Board (IRB) or ethical compliance approval',
      'Itemized indirect vs. direct research cost schedule'
    ],
    icon: 'FlaskConical',
    accentColor: 'teal'
  }
];

/**
 * Helper to get canonical URL for a country hub
 */
export function getCountryUrl(countrySlug: string): string {
  const origin = getSiteOrigin();
  return `${origin}/countries/${slugify(countrySlug)}`;
}

/**
 * Helper to get canonical URL for a category hub
 */
export function getCategoryUrl(categorySlug: string): string {
  const origin = getSiteOrigin();
  return `${origin}/categories/${slugify(categorySlug)}`;
}

/**
 * Helper to get canonical URL for a funding type hub
 */
export function getFundingTypeUrl(fundingTypeSlug: string): string {
  const origin = getSiteOrigin();
  return `${origin}/types/${slugify(fundingTypeSlug)}`;
}

/**
 * Extracts a normalized country slug from an opportunity's location string
 */
export function getCountrySlugFromLocation(location: string): string {
  if (!location) return 'global';
  const parts = location.split(',');
  const primary = parts[parts.length - 1].trim(); // Get country part after comma if any
  return slugify(primary || location);
}

/**
 * Quick Category mapping lookup for SEO metadata
 */
export const CATEGORIES_SEO_MAP: Record<string, { slug: string; name: string }> = {
  'business-and-startup-funding': { slug: 'business-startups', name: 'Business & Startup Funding' },
  'grants-and-innovation': { slug: 'grants', name: 'Grants & Innovation' },
  'scholarships-and-tuition': { slug: 'scholarships', name: 'Scholarships' },
  'fellowships-and-residencies': { slug: 'fellowships', name: 'Fellowships' },
  'competitions-and-prizes': { slug: 'competitions', name: 'Competitions & Prizes' },
  'ngo-and-community-funds': { slug: 'ngo-funding', name: 'NGO & Non-Profit' },
  'research-grants': { slug: 'research-grants', name: 'Research Grants' },
  'climate-and-sustainability': { slug: 'climate-sustainability', name: 'Climate & Sustainability' }
};

/**
 * Normalizes funding type string into canonical SEO funding type slug
 */
export function getFundingTypeSlug(type: OpportunityType | string): string {
  const normalized = type.toLowerCase();
  if (normalized.includes('grant') && !normalized.includes('research')) return 'grants';
  if (normalized.includes('scholarship')) return 'scholarships';
  if (normalized.includes('fellowship')) return 'fellowships';
  if (normalized.includes('ngo') || normalized.includes('non-profit')) return 'ngo-funding';
  if (normalized.includes('business') || normalized.includes('startup')) return 'business-funding';
  if (normalized.includes('competition') || normalized.includes('prize')) return 'competitions';
  if (normalized.includes('research')) return 'research-grants';
  return slugify(type);
}

/**
 * Lookup Funding Type info by slug
 */
export function getFundingTypeBySlug(slug: string): FundingTypeInfo | undefined {
  const clean = slug.toLowerCase().trim();
  return FUNDING_TYPE_SEO_PROFILES.find((f) => f.slug === clean || getFundingTypeSlug(f.type) === clean);
}

/**
 * Lookup Country SEO profile by slug or name
 */
export function getCountryBySlugOrName(slugOrName: string): CountryInfo {
  const target = slugify(slugOrName);
  const found = COUNTRY_SEO_PROFILES.find((c) => c.slug === target || slugify(c.name) === target);
  if (found) return found;

  // Dynamic fallback for any country not in the curated list
  const displayName = slugOrName
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    name: displayName,
    slug: target,
    code: target.slice(0, 2).toUpperCase(),
    flag: '🌍',
    region: 'Global',
    summary: `Discover verified grants, scholarships, fellowships, and startup funding programs available to applicants located in or connected with ${displayName}.`,
    currency: 'USD / Local Currency',
    popularCategories: ['Grants & Innovation', 'Scholarships', 'Business & Startup Funding', 'NGO & Non-Profit'],
    keyHighlights: [
      `International and regional grant windows accepting applicants in ${displayName}`,
      'Global fellowships with remote participation or travel funding',
      'Cross-border innovation competitions with verified non-dilutive awards'
    ],
    applicantTips: [
      `Check international eligibility criteria for applicants from ${displayName}`,
      'Ensure standard personal identity and organizational documentation are prepared',
      'Submit applications well ahead of final closing deadlines'
    ]
  };
}

/**
 * Matches opportunities that are eligible for a given country or region
 */
export function filterOpportunitiesByCountry(country?: CountryInfo | null, allOpportunities: Opportunity[] = []): Opportunity[] {
  if (!country) return allOpportunities;
  const cName = (country.name || '').toLowerCase();
  const cSlug = (country.slug || '').toLowerCase();

  return allOpportunities.filter((opp) => {
    if (!opp) return false;
    // 1. Direct location string match
    const loc = (opp.location || '').toLowerCase();
    if (cName && (loc.includes(cName) || loc.includes('global') || loc.includes('any country') || loc.includes('worldwide'))) {
      return true;
    }

    // 2. Region match
    if (country.region && country.region !== 'Global' && opp.region === country.region) {
      return true;
    }
    if (opp.region === 'Global') {
      return true;
    }

    // 3. EligibilityCriteria country list match
    if (opp.eligibilityCriteria?.eligibleCountries) {
      const eligible = opp.eligibilityCriteria.eligibleCountries.map((c) => (c || '').toLowerCase());
      if (eligible.includes('global') || (cName && (eligible.includes(cName) || eligible.some((e) => e.includes(cName))))) {
        return true;
      }
    }

    return false;
  });
}

/**
 * Filter opportunities by category
 */
export function filterOpportunitiesByCategory(category?: Category | null, allOpportunities: Opportunity[] = []): Opportunity[] {
  if (!category) return allOpportunities;
  const catName = (category.name || '').toLowerCase();
  const catSlug = category.slug || slugify(category.name || '');

  return allOpportunities.filter((opp) => {
    if (!opp) return false;
    const oppCat = (opp.category || '').toLowerCase();
    return (
      (catName && oppCat === catName) ||
      (catSlug && slugify(opp.category || '') === catSlug) ||
      (catName && (oppCat.includes(catName) || catName.includes(oppCat)))
    );
  });
}

/**
 * Filter opportunities by funding type
 */
export function filterOpportunitiesByFundingType(typeInfo?: FundingTypeInfo | null, allOpportunities: Opportunity[] = []): Opportunity[] {
  if (!typeInfo) return allOpportunities;
  return allOpportunities.filter((opp) => {
    if (!opp) return false;
    if (opp.type === typeInfo.type) return true;
    return getFundingTypeSlug(opp.type) === (typeInfo.slug || '');
  });
}

/**
 * Generates Schema.org JSON-LD for an Opportunity
 */
export function generateOpportunityJSONLD(opportunity: Opportunity, origin: string = getSiteOrigin()): Record<string, any> {
  const oppSlug = opportunity.slug || slugify(opportunity.title || '') || opportunity.id;
  const canonicalUrl = `${origin}/opportunities/${oppSlug}`;
  const amountText = opportunity.amount?.displayText || (opportunity.amount?.max ? `$${opportunity.amount.max}` : 'Unspecified');

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemPage',
    name: `${opportunity.title} — ${opportunity.organization}`,
    description: opportunity.summary || (opportunity.description ? opportunity.description.slice(0, 160) : ''),
    url: canonicalUrl,
    mainEntity: {
      '@type': opportunity.type === 'Scholarship' ? 'EducationalOccupationalProgram' : 'FinancialProduct',
      name: opportunity.title,
      description: opportunity.description || '',
      provider: {
        '@type': 'Organization',
        name: opportunity.organization,
        url: opportunity.officialSourceUrl || opportunity.applicationUrl || origin
      },
      category: opportunity.category,
      feesAndCommissionsSpecification: 'Free to apply on FundEcho (0% application fee)',
      amount: {
        '@type': 'MonetaryAmount',
        currency: opportunity.amount?.currency || 'USD',
        value: opportunity.amount?.max || opportunity.amount?.min || 0,
        description: amountText
      },
      validThrough: opportunity.deadline,
      areaServed: {
        '@type': 'AdministrativeArea',
        name: opportunity.location || opportunity.region || 'Global'
      },
      url: opportunity.applicationUrl || canonicalUrl
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${origin}/`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Opportunities',
          item: `${origin}/opportunities`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: opportunity.category,
          item: `${origin}/categories/${slugify(opportunity.category || '')}`
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: opportunity.title,
          item: canonicalUrl
        }
      ]
    }
  };
}

/**
 * Generates Schema.org JSON-LD for Category Landing Page
 */
export function generateCategoryJSONLD(category: Category, opportunities: Opportunity[] = [], origin: string = getSiteOrigin()): Record<string, any> {
  const catSlug = category?.slug || slugify(category?.name || 'category');
  const canonicalUrl = `${origin}/categories/${catSlug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category?.name || 'Category'} Funding, Grants & Awards — FundEcho`,
    description: category?.description || '',
    url: canonicalUrl,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: opportunities.length,
      itemListElement: opportunities.slice(0, 10).map((opp, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: opp.title,
        url: `${origin}/opportunities/${opp.slug || opp.id}`
      }))
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${origin}/`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Categories',
          item: `${origin}/directory`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: category?.name || 'Category',
          item: canonicalUrl
        }
      ]
    }
  };
}

/**
 * Generates Schema.org JSON-LD for Country/Region Landing Page
 */
export function generateCountryJSONLD(country: CountryInfo, opportunities: Opportunity[] = [], origin: string = getSiteOrigin()): Record<string, any> {
  const cSlug = country?.slug || slugify(country?.name || 'global');
  const canonicalUrl = `${origin}/countries/${cSlug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Funding & Grant Opportunities in ${country?.name || 'Region'} — FundEcho`,
    description: country?.summary || '',
    url: canonicalUrl,
    spatialCoverage: {
      '@type': 'Place',
      name: country?.name || 'Region'
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: opportunities.length,
      itemListElement: opportunities.slice(0, 10).map((opp, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: opp.title,
        url: `${origin}/opportunities/${opp.slug || opp.id}`
      }))
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${origin}/`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Locations',
          item: `${origin}/directory`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: country?.name || 'Region',
          item: canonicalUrl
        }
      ]
    }
  };
}

/**
 * Generates Schema.org JSON-LD for Funding Type Landing Page
 */
export function generateFundingTypeJSONLD(typeInfo: FundingTypeInfo, opportunities: Opportunity[] = [], origin: string = getSiteOrigin()): Record<string, any> {
  const tSlug = typeInfo?.slug || getFundingTypeSlug(typeInfo?.type || 'grant');
  const canonicalUrl = `${origin}/types/${tSlug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${typeInfo?.heading || typeInfo?.name || 'Funding'} — FundEcho`,
    description: typeInfo?.description || '',
    url: canonicalUrl,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: opportunities.length,
      itemListElement: opportunities.slice(0, 10).map((opp, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: opp.title,
        url: `${origin}/opportunities/${opp.slug || opp.id}`
      }))
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${origin}/`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Funding Types',
          item: `${origin}/directory`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: typeInfo?.name || 'Type',
          item: canonicalUrl
        }
      ]
    }
  };
}

/**
 * Generates XML Sitemap for Search Engine Discovery
 */
export function generateSitemapEntries(
  allOpportunities: Opportunity[],
  allCategories: Category[],
  countries: CountryInfo[] = COUNTRY_SEO_PROFILES,
  fundingTypes: FundingTypeInfo[] = FUNDING_TYPE_SEO_PROFILES,
  origin: string = getSiteOrigin()
): SitemapEntry[] {
  const now = new Date().toISOString().split('T')[0];

  const entries: SitemapEntry[] = [
    // 1. Static Key Pages
    {
      loc: `${origin}/`,
      lastmod: now,
      changefreq: 'daily',
      priority: 1.0,
      title: 'FundEcho — The Global Funding & Opportunity Network',
      type: 'home'
    },
    {
      loc: `${origin}/opportunities`,
      lastmod: now,
      changefreq: 'daily',
      priority: 0.9,
      title: 'Explore All Opportunities & Grants',
      type: 'directory'
    },
    {
      loc: `${origin}/directory`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.8,
      title: 'FundEcho Site Directory & Indexing Hub',
      type: 'directory'
    },
    {
      loc: `${origin}/about`,
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.5,
      title: 'About FundEcho & Verification Standards',
      type: 'static'
    },
    {
      loc: `${origin}/contact`,
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.4,
      title: 'Contact Support & Institutional Submissions',
      type: 'static'
    }
  ];

  // 2. Categories
  allCategories.forEach((cat) => {
    entries.push({
      loc: `${origin}/categories/${cat.slug}`,
      lastmod: now,
      changefreq: 'daily',
      priority: 0.85,
      title: `${cat.name} Funding & Grants`,
      type: 'category'
    });
  });

  // 3. Funding Types
  fundingTypes.forEach((ft) => {
    entries.push({
      loc: `${origin}/types/${ft.slug}`,
      lastmod: now,
      changefreq: 'daily',
      priority: 0.85,
      title: ft.heading,
      type: 'funding_type'
    });
  });

  // 4. Countries
  countries.forEach((country) => {
    entries.push({
      loc: `${origin}/countries/${country.slug}`,
      lastmod: now,
      changefreq: 'daily',
      priority: 0.8,
      title: `Funding & Grants in ${country.name}`,
      type: 'country'
    });
  });

  // 5. Individual Public Opportunities
  allOpportunities.forEach((opp) => {
    entries.push({
      loc: `${origin}/opportunities/${opp.slug}`,
      lastmod: opp.lastUpdated || opp.datePosted || now,
      changefreq: 'weekly',
      priority: opp.featured ? 0.9 : 0.75,
      title: `${opp.title} (${opp.organization})`,
      type: 'opportunity'
    });
  });

  return entries;
}

/**
 * Returns raw XML string for sitemap.xml
 */
export function generateXMLSitemap(
  allOpportunities: Opportunity[],
  allCategories: Category[],
  countries?: CountryInfo[],
  fundingTypes?: FundingTypeInfo[],
  origin?: string
): string {
  const entries = generateSitemapEntries(allOpportunities, allCategories, countries, fundingTypes, origin);

  const xmlUrls = entries
    .map(
      (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority.toFixed(2)}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;
}

/**
 * Safely applies dynamic SEO meta tags to the document head
 */
export function applySEOMetadata(metadata: SEOMetaData): () => void {
  if (typeof document === 'undefined') return () => {};

  // 1. Title
  const prevTitle = document.title;
  document.title = metadata.title;

  // 2. Helper to set or create meta tags
  const setMetaTag = (attrName: 'name' | 'property', attrValue: string, contentValue: string) => {
    let el = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', contentValue);
  };

  // Set standard meta
  setMetaTag('name', 'description', metadata.description);
  setMetaTag('name', 'robots', metadata.robots || 'index, follow');

  // Open Graph
  setMetaTag('property', 'og:title', metadata.ogTitle || metadata.title);
  setMetaTag('property', 'og:description', metadata.ogDescription || metadata.description);
  setMetaTag('property', 'og:url', metadata.canonicalUrl);
  setMetaTag('property', 'og:type', metadata.ogType || 'website');
  setMetaTag('property', 'og:site_name', SITE_NAME);
  setMetaTag('property', 'og:image', metadata.ogImage || DEFAULT_OG_IMAGE);

  // Twitter
  setMetaTag('name', 'twitter:card', metadata.twitterCard || 'summary_large_image');
  setMetaTag('name', 'twitter:title', metadata.ogTitle || metadata.title);
  setMetaTag('name', 'twitter:description', metadata.ogDescription || metadata.description);
  setMetaTag('name', 'twitter:image', metadata.ogImage || DEFAULT_OG_IMAGE);

  // Canonical link tag
  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', metadata.canonicalUrl);

  // Structured Data Schema (JSON-LD)
  let schemaEl = document.getElementById('fundora-jsonld-schema') as HTMLScriptElement | null;
  if (metadata.jsonLdSchema) {
    if (!schemaEl) {
      schemaEl = document.createElement('script');
      schemaEl.id = 'fundora-jsonld-schema';
      schemaEl.type = 'application/ld+json';
      document.head.appendChild(schemaEl);
    }
    schemaEl.textContent = JSON.stringify(metadata.jsonLdSchema, null, 2);
  } else if (schemaEl) {
    schemaEl.remove();
  }

  // Cleanup handler
  return () => {
    // Optionally restore title
    document.title = prevTitle;
  };
}
