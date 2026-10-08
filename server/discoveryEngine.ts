/**
 * FUNDECHO - OPPORTUNITY DISCOVERY ENGINE (STEP 4)
 * Backend foundation that discovers potential opportunity URLs from sources stored
 * in the "sources" collection and records discovered links in "crawlResults".
 *
 * Core Capabilities:
 * - Processes active sources from the registry
 * - Respects crawling restrictions (robots.txt, rate limits, timeouts, polite User-Agent)
 * - Discovers relevant opportunity pages (Grants, Scholarships, Fellowships, Funding, Competitions, Accelerators, Awards)
 * - Normalizes URLs and avoids repeatedly processing the same URL (deduplication)
 * - Creates auditable crawl execution tasks in "crawlJobs"
 * - Records discovered URLs with discovery date, source, URL, and processing status ("unprocessed") in "crawlResults"
 * - Safely handles network failures, timeouts, 4xx/5xx HTTP codes, and logs errors
 * - Strictly boundaries discovery: does not create final opportunity listings or publish anything
 */

import crypto from "crypto";

// =============================================================================
// 1. TYPES & SCHEMAS
// =============================================================================

export type OpportunityClassification =
  | "Grant"
  | "Scholarship"
  | "Fellowship"
  | "Funding"
  | "Competition"
  | "Accelerator"
  | "Award"
  | "Opportunity";

export interface DiscoveredOpportunityLink {
  url: string;
  normalizedUrl: string;
  urlHash: string;
  pageTitle: string;
  anchorText: string;
  snippet: string;
  opportunityType: OpportunityClassification;
  confidenceScore: number;
  matchedKeywords: string[];
  discoveryDate: string; // YYYY-MM-DD
  discoveredAt: string; // ISO timestamp
}

export interface CrawlJobErrorRecord {
  url?: string;
  message: string;
  statusCode?: number;
  timestamp: string;
}

export interface DiscoveryJobMetrics {
  jobId: string;
  sourceId: string;
  sourceName: string;
  sourceDomain: string;
  status: "queued" | "running" | "completed" | "failed";
  startedAt: string;
  completedAt?: string;
  durationSeconds?: number;
  pagesScrapedCount: number;
  opportunitiesFoundCount: number;
  duplicatesSkippedCount: number;
  errorsCount: number;
  errorLogs: CrawlJobErrorRecord[];
  summaryMessage?: string;
}

export interface DiscoverySourceInput {
  id: string;
  sourceName?: string;
  name?: string;
  organization?: string;
  websiteUrl?: string;
  baseUrl?: string;
  domain?: string;
  targetUrls?: string[];
  countryRegion?: string;
  region?: string;
  sourceType?: string;
  opportunityCategories?: string[];
  categories?: string[];
  trustLevel?: string;
  status?: string;
  crawlFrequency?: string;
  crawlFrequencyHours?: number;
  lastCrawled?: string | null;
  rateLimitMs?: number;
  notes?: string;
}

export interface DiscoveryRunResult {
  jobId: string;
  sourceId: string;
  sourceName: string;
  sourceDomain: string;
  status: "completed" | "failed";
  pagesScraped: number;
  opportunitiesDiscovered: number;
  duplicatesSkipped: number;
  errorsCount: number;
  discoveredItems: DiscoveredOpportunityLink[];
  errorLogs: CrawlJobErrorRecord[];
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  summaryMessage: string;
}

// In-memory rate limiting state per domain to avoid hammering third-party servers
const domainLastRequestTimes = new Map<string, number>();

// In-memory robots.txt disallow rules cache
const robotsDisallowRulesCache = new Map<string, { rules: string[]; expiresAt: number }>();

// In-memory store of recently discovered URLs to prevent duplicates in local/hybrid state
const discoveredUrlsGlobalSet = new Set<string>();

// =============================================================================
// 2. URL NORMALIZATION & DEDUPLICATION UTILITIES
// =============================================================================

const STATIC_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "gif", "svg", "webp", "ico", "bmp", "tiff",
  "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "zip", "tar", "gz",
  "mp3", "mp4", "wav", "avi", "mov", "css", "js", "json", "xml", "rss"
]);

const IGNORED_PATH_PATTERNS = [
  /\/login\b/i,
  /\/signin\b/i,
  /\/signup\b/i,
  /\/register\b/i,
  /\/logout\b/i,
  /\/cart\b/i,
  /\/checkout\b/i,
  /\/wp-admin\b/i,
  /\/wp-login\b/i,
  /\/user\/profile\b/i,
  /\/my-account\b/i,
  /\/privacy-policy\b/i,
  /\/terms-of-service\b/i,
  /\/terms-and-conditions\b/i,
  /\/cookie-policy\b/i,
  /\/password-reset\b/i,
  /\/feed\/?$/i,
];

const TRACKING_QUERY_PARAMS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "fbclid", "gclid", "gclsrc", "dclid", "msclkid", "ref", "source", "mc_cid",
  "mc_eid", "_ga", "_gl", "token", "session_id", "callback"
]);

/**
 * Normalizes a URL: resolves relative paths, strips tracking query parameters,
 * removes hash anchors, lowercases hostname, and generates clean canonical URL.
 */
export function normalizeOpportunityUrl(rawUrl: string, baseUrl?: string): string | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;

  const trimmed = rawUrl.trim();
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("data:")
  ) {
    return null;
  }

  try {
    const parsed = baseUrl ? new URL(trimmed, baseUrl) : new URL(trimmed);

    // Only allow http and https
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    // Filter out static asset files
    const pathname = parsed.pathname;
    const pathParts = pathname.split("/");
    const lastPart = pathParts[pathParts.length - 1] || "";
    if (lastPart.includes(".")) {
      const ext = lastPart.split(".").pop()?.toLowerCase();
      if (ext && STATIC_EXTENSIONS.has(ext)) {
        return null;
      }
    }

    // Filter out common non-content / authentication paths
    for (const pattern of IGNORED_PATH_PATTERNS) {
      if (pattern.test(pathname)) {
        return null;
      }
    }

    // Clean tracking query parameters
    const searchParams = new URLSearchParams(parsed.search);
    for (const key of Array.from(searchParams.keys())) {
      if (TRACKING_QUERY_PARAMS.has(key.toLowerCase()) || key.startsWith("utm_")) {
        searchParams.delete(key);
      }
    }
    parsed.search = searchParams.toString();

    // Remove hash
    parsed.hash = "";

    // Lowercase hostname and ensure standard protocol
    parsed.hostname = parsed.hostname.toLowerCase();

    // Strip trailing slash unless it's the root path "/"
    let normalized = parsed.toString();
    if (normalized.endsWith("/") && parsed.pathname !== "/") {
      normalized = normalized.slice(0, -1);
    }

    return normalized;
  } catch {
    return null;
  }
}

/**
 * Generates a SHA-256 hash of a normalized URL to support deterministic deduplication.
 */
export function generateUrlHash(url: string): string {
  return crypto.createHash("sha256").update(url.trim().toLowerCase()).digest("hex");
}

// =============================================================================
// 3. OPPORTUNITY CLASSIFICATION & PATTERN DETECTION
// =============================================================================

interface PatternRule {
  type: OpportunityClassification;
  keywords: RegExp[];
  weight: number;
}

const OPPORTUNITY_RULES: PatternRule[] = [
  {
    type: "Scholarship",
    keywords: [
      /\bscholarships?\b/i,
      /\btuition-?(?:waiver|support|grant)\b/i,
      /\bundergraduate-scholarship\b/i,
      /\bpostgraduate-scholarship\b/i,
      /\bbursar(?:y|ies)\b/i,
      /\bstudent-awards?\b/i,
      /\bacademic-scholarship\b/i,
    ],
    weight: 25,
  },
  {
    type: "Fellowship",
    keywords: [
      /\bfellowships?\b/i,
      /\bfellows?-program\b/i,
      /\bpostdoctoral-fellowship\b/i,
      /\bvisiting-fellow\b/i,
      /\bresearch-fellow\b/i,
      /\bresidency-fellowship\b/i,
    ],
    weight: 25,
  },
  {
    type: "Grant",
    keywords: [
      /\bgrants?\b/i,
      /\bgrant-opportunities?\b/i,
      /\bgrant-program\b/i,
      /\bcall-for-proposals?\b/i,
      /\brequest-for-proposals?\b/i,
      /\brfp\b/i,
      /\bapply-for-grant\b/i,
      /\bresearch-grant\b/i,
      /\bproject-grant\b/i,
      /\bcommunity-grant\b/i,
      /\btravel-grant\b/i,
      /\bseed-grant\b/i,
    ],
    weight: 20,
  },
  {
    type: "Competition",
    keywords: [
      /\bcompetitions?\b/i,
      /\bprizes?\b/i,
      /\bchallenges?\b/i,
      /\bhackathons?\b/i,
      /\bcontests?\b/i,
      /\binnovation-challenge\b/i,
      /\bglobal-challenge\b/i,
    ],
    weight: 20,
  },
  {
    type: "Accelerator",
    keywords: [
      /\baccelerators?\b/i,
      /\bincubators?\b/i,
      /\bstartup-program\b/i,
      /\bapply-accelerator\b/i,
      /\bstartup-batch\b/i,
      /\bcohort-application\b/i,
      /\bseed-fund(?:ing)?\b/i,
    ],
    weight: 20,
  },
  {
    type: "Award",
    keywords: [
      /\bawards?\b/i,
      /\bexcellence-award\b/i,
      /\bmerit-award\b/i,
      /\brecognition-award\b/i,
      /\bcall-for-nominations?\b/i,
    ],
    weight: 15,
  },
  {
    type: "Funding",
    keywords: [
      /\bfunding-opportunities?\b/i,
      /\bfunding-program\b/i,
      /\bopen-calls?\b/i,
      /\bapply-now\b/i,
      /\bfinancial-support\b/i,
      /\bfinancial-aid\b/i,
      /\bcapital-grant\b/i,
      /\bhow-to-apply\b/i,
    ],
    weight: 15,
  },
];

/**
 * Evaluates whether a discovered URL or link context corresponds to a funding opportunity.
 * Returns classification type, confidence score, and matched indicators.
 */
export function classifyOpportunityLink(
  url: string,
  anchorText = "",
  surroundingContext = ""
): {
  isOpportunity: boolean;
  opportunityType: OpportunityClassification;
  confidenceScore: number;
  matchedKeywords: string[];
} {
  const combinedText = `${url} ${anchorText} ${surroundingContext}`.toLowerCase();
  const matchedKeywords: string[] = [];
  let highestScore = 0;
  let detectedType: OpportunityClassification = "Opportunity";

  for (const rule of OPPORTUNITY_RULES) {
    let ruleMatches = 0;
    for (const regex of rule.keywords) {
      if (regex.test(combinedText)) {
        ruleMatches++;
        matchedKeywords.push(regex.source.replace(/[\\^$()|?]/g, ""));
      }
    }

    if (ruleMatches > 0) {
      // Calculate weighted score
      const score = Math.min(ruleMatches * rule.weight + (url.includes("/apply") || url.includes("/grant") ? 20 : 0), 98);
      if (score > highestScore) {
        highestScore = score;
        detectedType = rule.type;
      }
    }
  }

  // Bonus points for action verbs like /apply, /guidelines, /submit, /proposals
  const hasActionSegment = /\/(?:apply|apply-now|guidelines|proposals|calls|open-calls|submit|application|eligibility)\b/i.test(url);
  if (hasActionSegment) {
    highestScore = Math.min(highestScore + 15, 98);
    matchedKeywords.push("action_segment");
  }

  // General funding indicator fallback
  if (highestScore === 0) {
    const genericMatch = /\b(?:grant|funding|scholarship|fellowship|award|prize|competition|accelerator|call)\b/i.test(combinedText);
    if (genericMatch) {
      highestScore = 65;
      detectedType = "Opportunity";
      matchedKeywords.push("generic_opportunity_indicator");
    }
  }

  return {
    isOpportunity: highestScore >= 50,
    opportunityType: detectedType,
    confidenceScore: highestScore,
    matchedKeywords: Array.from(new Set(matchedKeywords)),
  };
}

// =============================================================================
// 4. RESPECTFUL CRAWLING: ROBOTS.TXT & RATE LIMITING
// =============================================================================

/**
 * Checks basic robots.txt restrictions for a target domain.
 * Caches results in memory for 1 hour to prevent redundant requests.
 */
export async function checkRobotsAllowed(domain: string, pathname: string): Promise<boolean> {
  const now = Date.now();
  const cached = robotsDisallowRulesCache.get(domain);

  let disallowRules: string[] = [];

  if (cached && cached.expiresAt > now) {
    disallowRules = cached.rules;
  } else {
    try {
      const robotsUrl = `https://${domain}/robots.txt`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

      const res = await fetch(robotsUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "FundEchoBot/1.0 (+https://fundecho.org/bot; opportunity-discovery@fundecho.org)",
        },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const text = await res.text();
        const lines = text.split("\n");
        let appliesToAll = false;

        for (const line of lines) {
          const clean = line.trim().toLowerCase();
          if (clean.startsWith("user-agent:")) {
            const agent = clean.replace("user-agent:", "").trim();
            appliesToAll = agent === "*" || agent.includes("fundechobot");
          } else if (appliesToAll && clean.startsWith("disallow:")) {
            const rulePath = line.replace(/disallow:/i, "").trim();
            if (rulePath && rulePath !== "") {
              disallowRules.push(rulePath);
            }
          }
        }
      }
    } catch {
      // If robots.txt cannot be fetched or times out, default to permissive but gentle
      disallowRules = [];
    }

    robotsDisallowRulesCache.set(domain, {
      rules: disallowRules,
      expiresAt: now + 60 * 60 * 1000, // 1 hour
    });
  }

  // Evaluate path against disallow rules
  for (const rule of disallowRules) {
    if (rule === "/" && pathname !== "/") return false;
    if (rule.length > 1 && pathname.startsWith(rule)) return false;
  }

  return true;
}

/**
 * Enforces polite domain-level rate limiting between sequential crawler requests.
 */
export async function applyDomainRateLimit(domain: string, minIntervalMs = 1200): Promise<void> {
  const now = Date.now();
  const lastTime = domainLastRequestTimes.get(domain) || 0;
  const elapsed = now - lastTime;

  if (elapsed < minIntervalMs) {
    const waitTime = minIntervalMs - elapsed;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  domainLastRequestTimes.set(domain, Date.now());
}

/**
 * Safe HTTP GET fetcher with timeout, polite headers, and error capture.
 */
export async function fetchPageSafe(
  url: string,
  domain: string,
  rateLimitMs = 1200
): Promise<{ ok: boolean; status: number; html: string; error?: string }> {
  try {
    // 1. Check robots.txt
    const parsed = new URL(url);
    const allowed = await checkRobotsAllowed(domain, parsed.pathname);
    if (!allowed) {
      return {
        ok: false,
        status: 403,
        html: "",
        error: `Crawling restricted by robots.txt for path: ${parsed.pathname}`,
      };
    }

    // 2. Apply rate limit
    await applyDomainRateLimit(domain, rateLimitMs);

    // 3. Make request with 9s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "FundEchoBot/1.0 (+https://fundecho.org/discovery; opportunity-scanner@fundecho.org)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      },
      redirect: "follow",
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        html: "",
        error: `HTTP ${res.status}: ${res.statusText}`,
      };
    }

    const html = await res.text();
    return { ok: true, status: res.status, html };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      html: "",
      error: err?.name === "AbortError" ? "Request timed out after 9 seconds" : err?.message || "Network request failed",
    };
  }
}

// =============================================================================
// 5. HTML PARSING & LINK DISCOVERY EXTRACTOR
// =============================================================================

/**
 * Extracts candidate opportunity links and page titles from HTML text.
 */
export function extractOpportunityLinksFromHtml(
  html: string,
  sourceUrl: string,
  sourceDomain: string
): DiscoveredOpportunityLink[] {
  if (!html || typeof html !== "string") return [];

  const discoveredLinks: DiscoveredOpportunityLink[] = [];
  const seenUrlsInPage = new Set<string>();
  const today = new Date().toISOString().split("T")[0];
  const nowIso = new Date().toISOString();

  // 1. Extract HTML page <title> if present
  let pageTitle = "";
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    pageTitle = titleMatch[1].trim().replace(/\s+/g, " ");
  }

  // 2. Regex scan for href anchors: <a href="..." ...>...</a>
  const anchorRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis;
  let match: RegExpExecArray | null;

  while ((match = anchorRegex.exec(html)) !== null) {
    const rawHref = match[1];
    const rawAnchorText = match[2]?.replace(/<[^>]*>/g, "").trim().replace(/\s+/g, " ") || "";

    const normalized = normalizeOpportunityUrl(rawHref, sourceUrl);
    if (!normalized) continue;

    // Avoid duplicate links on the exact same page
    if (seenUrlsInPage.has(normalized)) continue;
    seenUrlsInPage.add(normalized);

    // Only stay within or closely related to the source domain
    try {
      const parsedUrl = new URL(normalized);
      const urlDomain = parsedUrl.hostname.replace(/^www\./, "").toLowerCase();
      const cleanSourceDomain = sourceDomain.replace(/^www\./, "").toLowerCase();

      // Allow same domain or recognized institutional partner subdomains
      const isDomainMatch = urlDomain === cleanSourceDomain || urlDomain.endsWith(`.${cleanSourceDomain}`);
      if (!isDomainMatch) continue;
    } catch {
      continue;
    }

    // Capture surrounding context snippet (~120 chars around the anchor)
    const matchIndex = match.index;
    const start = Math.max(0, matchIndex - 60);
    const end = Math.min(html.length, matchIndex + match[0].length + 60);
    const rawSnippet = html.slice(start, end).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

    // Evaluate opportunity classification
    const classification = classifyOpportunityLink(normalized, rawAnchorText, rawSnippet);

    if (classification.isOpportunity) {
      const urlHash = generateUrlHash(normalized);
      discoveredLinks.push({
        url: normalized,
        normalizedUrl: normalized,
        urlHash,
        pageTitle: rawAnchorText || pageTitle || "Discovered Opportunity Page",
        anchorText: rawAnchorText,
        snippet: rawSnippet.slice(0, 240),
        opportunityType: classification.opportunityType,
        confidenceScore: classification.confidenceScore,
        matchedKeywords: classification.matchedKeywords,
        discoveryDate: today,
        discoveredAt: nowIso,
      });
    }
  }

  return discoveredLinks;
}

// =============================================================================
// 6. DISCOVERY ENGINE CORE RUNNER
// =============================================================================

export interface DiscoveryEngineRunOptions {
  sourceId?: string; // If specified, processes only this single source
  maxPagesPerSource?: number; // Limit pages to crawl per source (default 5)
  existingUrlsSet?: Set<string>; // Set of already known/processed URLs
  adminUserId?: string;
  triggerType?: "scheduler" | "manual_admin" | "webhook" | "retry";
}

/**
 * Runs the discovery engine for a single source:
 * 1. Initializes crawl job record
 * 2. Fetches target URLs and monitors entry points
 * 3. Discovers opportunity URLs
 * 4. Deduplicates against already known URLs
 * 5. Returns structured results ready for crawlResults and crawlJobs storage
 */
export async function runDiscoveryForSource(
  source: DiscoverySourceInput,
  options: DiscoveryEngineRunOptions = {}
): Promise<DiscoveryRunResult> {
  const startTime = Date.now();
  const startedAt = new Date().toISOString();
  const sourceName = source.sourceName || source.name || source.organization || "Monitored Source";
  const rawUrl = source.websiteUrl || source.baseUrl || "https://fundecho.org";

  let domain = source.domain;
  if (!domain) {
    try {
      domain = new URL(rawUrl).hostname.replace(/^www\./, "").toLowerCase();
    } catch {
      domain = "fundecho.org";
    }
  }

  const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const errorLogs: CrawlJobErrorRecord[] = [];
  const discoveredItems: DiscoveredOpportunityLink[] = [];
  let pagesScrapedCount = 0;
  let duplicatesSkippedCount = 0;

  // Determine list of entry URLs to discover from
  const targetUrls = source.targetUrls && source.targetUrls.length > 0 ? source.targetUrls : [rawUrl];
  const maxPages = options.maxPagesPerSource || 5;
  const urlsToVisit = targetUrls.slice(0, maxPages);

  const existingUrls = options.existingUrlsSet || discoveredUrlsGlobalSet;

  for (const pageUrl of urlsToVisit) {
    pagesScrapedCount++;

    const fetchResult = await fetchPageSafe(pageUrl, domain, source.rateLimitMs || 1000);

    if (!fetchResult.ok) {
      errorLogs.push({
        url: pageUrl,
        message: fetchResult.error || `HTTP ${fetchResult.status} failure`,
        statusCode: fetchResult.status || 500,
        timestamp: new Date().toISOString(),
      });
      continue;
    }

    // Extract links from HTML
    const extractedLinks = extractOpportunityLinksFromHtml(fetchResult.html, pageUrl, domain);

    for (const link of extractedLinks) {
      // Deduplication check: avoid repeatedly processing the same URL
      if (existingUrls.has(link.normalizedUrl) || discoveredUrlsGlobalSet.has(link.normalizedUrl)) {
        duplicatesSkippedCount++;
        continue;
      }

      // Record to run results and track locally
      existingUrls.add(link.normalizedUrl);
      discoveredUrlsGlobalSet.add(link.normalizedUrl);
      discoveredItems.push(link);
    }
  }

  const completedAt = new Date().toISOString();
  const durationSeconds = Math.round((Date.now() - startTime) / 1000);
  const status: "completed" | "failed" = pagesScrapedCount > 0 && errorLogs.length < pagesScrapedCount ? "completed" : errorLogs.length > 0 && discoveredItems.length === 0 ? "failed" : "completed";

  const summaryMessage = `Processed ${pagesScrapedCount} page(s) for ${sourceName}. Discovered ${discoveredItems.length} new opportunity URL(s), skipped ${duplicatesSkippedCount} duplicate(s), encountered ${errorLogs.length} error(s).`;

  return {
    jobId,
    sourceId: source.id,
    sourceName,
    sourceDomain: domain,
    status,
    pagesScraped: pagesScrapedCount,
    opportunitiesDiscovered: discoveredItems.length,
    duplicatesSkipped: duplicatesSkippedCount,
    errorsCount: errorLogs.length,
    discoveredItems,
    errorLogs,
    startedAt,
    completedAt,
    durationSeconds,
    summaryMessage,
  };
}

/**
 * Runs discovery engine across a collection of active sources.
 */
export async function runDiscoveryEngine(
  sources: DiscoverySourceInput[],
  options: DiscoveryEngineRunOptions = {}
): Promise<{
  totalSourcesProcessed: number;
  totalOpportunitiesDiscovered: number;
  totalDuplicatesSkipped: number;
  totalErrors: number;
  results: DiscoveryRunResult[];
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
}> {
  const engineStartTime = Date.now();
  const startedAt = new Date().toISOString();

  // Filter only active sources
  const activeSources = sources.filter((s) => {
    if (options.sourceId) {
      return s.id === options.sourceId;
    }
    const st = (s.status || "Active").toLowerCase();
    return st === "active";
  });

  const results: DiscoveryRunResult[] = [];
  let totalOpportunitiesDiscovered = 0;
  let totalDuplicatesSkipped = 0;
  let totalErrors = 0;

  for (const source of activeSources) {
    try {
      const sourceResult = await runDiscoveryForSource(source, options);
      results.push(sourceResult);
      totalOpportunitiesDiscovered += sourceResult.opportunitiesDiscovered;
      totalDuplicatesSkipped += sourceResult.duplicatesSkipped;
      totalErrors += sourceResult.errorsCount;
    } catch (err: any) {
      results.push({
        jobId: `job_${Date.now()}_err`,
        sourceId: source.id,
        sourceName: source.sourceName || source.name || "Source",
        sourceDomain: source.domain || "unknown",
        status: "failed",
        pagesScraped: 0,
        opportunitiesDiscovered: 0,
        duplicatesSkipped: 0,
        errorsCount: 1,
        discoveredItems: [],
        errorLogs: [
          {
            url: source.websiteUrl || "",
            message: err?.message || "Unexpected discovery engine exception",
            statusCode: 500,
            timestamp: new Date().toISOString(),
          },
        ],
        startedAt,
        completedAt: new Date().toISOString(),
        durationSeconds: 0,
        summaryMessage: `Failed to process source ${source.id}: ${err?.message}`,
      });
      totalErrors++;
    }
  }

  const completedAt = new Date().toISOString();
  const durationSeconds = Math.round((Date.now() - engineStartTime) / 1000);

  return {
    totalSourcesProcessed: activeSources.length,
    totalOpportunitiesDiscovered,
    totalDuplicatesSkipped,
    totalErrors,
    results,
    startedAt,
    completedAt,
    durationSeconds,
  };
}
