import { Opportunity } from '../types';
import { IncomingOpportunity, DuplicateCandidate } from '../types/pipeline';
import { getAllAdminOpportunities } from './adminStorage';

/**
 * Normalizes text for comparison (lowercase, strip punctuation, remove stop words)
 */
function tokenize(text: string): string[] {
  const stopWords = new Set([
    'the', 'and', 'for', 'of', 'in', 'to', 'a', 'an', 'on', 'with', 'by', 'at', 'from',
    'grant', 'grants', 'program', 'fund', 'funding', 'award', 'fellowship', '2025', '2026', '2027', 'opportunity'
  ]);

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1 && !stopWords.has(token));
}

/**
 * Calculates Token Jaccard/Dice Similarity between two strings (0.0 to 1.0)
 */
function calculateTextSimilarity(textA: string, textB: string): number {
  if (!textA || !textB) return 0;
  const aNorm = textA.toLowerCase().trim();
  const bNorm = textB.toLowerCase().trim();

  if (aNorm === bNorm) return 1.0;

  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);

  if (tokensA.length === 0 || tokensB.length === 0) {
    return aNorm.includes(bNorm) || bNorm.includes(aNorm) ? 0.75 : 0;
  }

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  let intersectionCount = 0;
  for (const t of setA) {
    if (setB.has(t)) {
      intersectionCount++;
    }
  }

  // Dice coefficient: 2 * |A ∩ B| / (|A| + |B|)
  const dice = (2 * intersectionCount) / (setA.size + setB.size);
  return dice;
}

/**
 * Checks if URLs share the same origin and path prefix
 */
function compareUrls(urlA?: string, urlB?: string): { isExact: boolean; isSameDomain: boolean } {
  if (!urlA || !urlB) return { isExact: false, isSameDomain: false };
  const cleanA = urlA.trim().toLowerCase().replace(/\/+$/, '');
  const cleanB = urlB.trim().toLowerCase().replace(/\/+$/, '');

  if (cleanA === cleanB) {
    return { isExact: true, isSameDomain: true };
  }

  try {
    const parsedA = new URL(cleanA);
    const parsedB = new URL(cleanB);
    const hostA = parsedA.hostname.replace(/^www\./, '');
    const hostB = parsedB.hostname.replace(/^www\./, '');
    const isSameDomain = hostA === hostB;
    return { isExact: false, isSameDomain };
  } catch {
    return { isExact: false, isSameDomain: false };
  }
}

/**
 * Evaluates duplicate probability between an incoming opportunity and a target record
 */
function evaluatePair(
  incoming: Partial<IncomingOpportunity>,
  target: {
    id: string;
    title: string;
    organization: string;
    sourceUrl?: string;
    applicationUrl?: string;
    deadline?: string;
    category?: string;
  },
  isExistingCatalog: boolean
): DuplicateCandidate | null {
  if (incoming.id === target.id) return null;

  const reasons: string[] = [];
  let scoreWeights = 0;
  let totalScore = 0;

  // 1. Title Similarity (Weight: 45)
  const titleSim = calculateTextSimilarity(incoming.title || '', target.title || '');
  scoreWeights += 45;
  totalScore += titleSim * 45;

  if (titleSim > 0.8) {
    reasons.push(`High title similarity (${Math.round(titleSim * 100)}%)`);
  } else if (titleSim > 0.5) {
    reasons.push(`Partial title match (${Math.round(titleSim * 100)}%)`);
  }

  // 2. Organization Match (Weight: 30)
  const orgSim = calculateTextSimilarity(incoming.organization || '', target.organization || '');
  scoreWeights += 30;
  totalScore += orgSim * 30;

  if (orgSim > 0.8) {
    reasons.push(`Same provider organization: "${target.organization}"`);
  } else if (orgSim > 0.4) {
    reasons.push(`Related organization naming`);
  }

  // 3. URL Comparison (Weight: 25)
  const sourceUrlComp = compareUrls(incoming.sourceUrl, target.sourceUrl || target.applicationUrl);
  const appUrlComp = compareUrls(incoming.applicationUrl, target.applicationUrl || target.sourceUrl);

  scoreWeights += 25;
  if (sourceUrlComp.isExact || appUrlComp.isExact) {
    totalScore += 25;
    reasons.push('Identical source or application link');
  } else if (sourceUrlComp.isSameDomain || appUrlComp.isSameDomain) {
    totalScore += 15;
    reasons.push('Identical portal domain');
  }

  const finalMatchScore = Math.min(100, Math.round((totalScore / scoreWeights) * 100));

  // If score is above 40%, flag as duplicate candidate
  if (finalMatchScore >= 40 && reasons.length > 0) {
    return {
      opportunityId: target.id,
      title: target.title,
      organization: target.organization,
      sourceUrl: target.sourceUrl || target.applicationUrl,
      matchScore: finalMatchScore,
      matchReasons: reasons,
      isExistingInCatalog: isExistingCatalog,
      existingRecord: target,
    };
  }

  return null;
}

/**
 * Scans catalog and other incoming records for potential duplicates
 */
export function findDuplicateCandidates(
  incoming: Partial<IncomingOpportunity>,
  otherIncoming: IncomingOpportunity[] = []
): DuplicateCandidate[] {
  const catalog = getAllAdminOpportunities();
  const candidates: DuplicateCandidate[] = [];
  const ignored = new Set(incoming.ignoredDuplicates || []);

  // 1. Check against Catalog opportunities
  for (const opp of catalog) {
    if (ignored.has(opp.id)) continue;
    const cand = evaluatePair(
      incoming,
      {
        id: opp.id,
        title: opp.title,
        organization: opp.organization,
        sourceUrl: opp.officialSourceUrl || opp.source,
        applicationUrl: opp.applicationUrl,
        deadline: opp.deadline,
        category: opp.category,
      },
      true
    );
    if (cand) {
      candidates.push(cand);
    }
  }

  // 2. Check against other incoming opportunities in pipeline
  for (const other of otherIncoming) {
    if (other.id === incoming.id) continue;
    if (ignored.has(other.id)) continue;
    const cand = evaluatePair(
      incoming,
      {
        id: other.id,
        title: other.title,
        organization: other.organization,
        sourceUrl: other.sourceUrl,
        applicationUrl: other.applicationUrl,
        deadline: other.deadline,
        category: other.category,
      },
      false
    );
    if (cand) {
      candidates.push(cand);
    }
  }

  // Sort descending by highest match score
  return candidates.sort((a, b) => b.matchScore - a.matchScore);
}
