import { Opportunity, Category, OpportunityType, OpportunityRegion } from './index';

export interface BreadcrumbItem {
  name: string;
  url: string;
  item?: string;
}

export interface SEOMetaData {
  title: string;
  description: string;
  canonicalUrl: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  robots?: 'index, follow' | 'noindex, nofollow' | 'index, nofollow';
  keywords?: string[];
  breadcrumbs?: BreadcrumbItem[];
  jsonLdSchema?: Record<string, any> | Array<Record<string, any>>;
}

export interface CountryInfo {
  name: string;
  slug: string;
  code: string;
  flag: string;
  region: OpportunityRegion;
  summary: string;
  currency: string;
  popularCategories: string[];
  keyHighlights: string[];
  applicantTips: string[];
}

export interface FundingTypeInfo {
  type: OpportunityType;
  name: string;
  slug: string;
  heading: string;
  tagline: string;
  description: string;
  whoIsThisFor: string;
  avgAwardRange: string;
  keyBenefits: string[];
  typicalRequirements: string[];
  icon: string;
  accentColor: string;
}

export interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  title: string;
  type: 'home' | 'directory' | 'opportunity' | 'category' | 'country' | 'funding_type' | 'static';
}
