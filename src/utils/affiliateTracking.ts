import { AffiliatePerformanceStats, AffiliateTrackingEvent } from '../types/affiliate';
import { getStoredAffiliateOffers } from '../data/affiliateData';

const TRACKING_EVENTS_STORAGE_KEY = 'fundora_affiliate_events_v1';

// Initial baseline mock tracking data for realistic demo performance metrics
const INITIAL_DEMO_EVENTS: AffiliateTrackingEvent[] = [
  { id: 'evt-1', eventType: 'impression', offerId: 'aff-ledgerbloom-01', placement: 'opportunity_detail', matchScore: 92, timestamp: '2025-03-01T10:00:00Z' },
  { id: 'evt-2', eventType: 'impression', offerId: 'aff-ledgerbloom-01', placement: 'opportunity_detail', matchScore: 92, timestamp: '2025-03-01T10:05:00Z' },
  { id: 'evt-3', eventType: 'click', offerId: 'aff-ledgerbloom-01', placement: 'opportunity_detail', matchScore: 92, timestamp: '2025-03-01T10:06:00Z' },
  { id: 'evt-4', eventType: 'impression', offerId: 'aff-grantpro-02', placement: 'opportunity_detail', matchScore: 89, timestamp: '2025-03-01T11:00:00Z' },
  { id: 'evt-5', eventType: 'click', offerId: 'aff-grantpro-02', placement: 'opportunity_detail', matchScore: 89, timestamp: '2025-03-01T11:02:00Z' },
  { id: 'evt-6', eventType: 'impression', offerId: 'aff-eduprep-03', placement: 'user_dashboard', matchScore: 88, timestamp: '2025-03-01T12:00:00Z' },
  { id: 'evt-7', eventType: 'impression', offerId: 'aff-eduprep-03', placement: 'user_dashboard', matchScore: 88, timestamp: '2025-03-01T12:15:00Z' },
  { id: 'evt-8', eventType: 'click', offerId: 'aff-eduprep-03', placement: 'user_dashboard', matchScore: 88, timestamp: '2025-03-01T12:16:00Z' },
  { id: 'evt-9', eventType: 'impression', offerId: 'aff-causemetrics-04', placement: 'opportunity_detail', matchScore: 84, timestamp: '2025-03-01T13:00:00Z' },
  { id: 'evt-10', eventType: 'impression', offerId: 'aff-siteforge-05', placement: 'user_dashboard', matchScore: 78, timestamp: '2025-03-01T14:00:00Z' },
  { id: 'evt-11', eventType: 'click', offerId: 'aff-siteforge-05', placement: 'user_dashboard', matchScore: 78, timestamp: '2025-03-01T14:03:00Z' },
];

function getStoredEvents(): AffiliateTrackingEvent[] {
  try {
    const raw = localStorage.getItem(TRACKING_EVENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TRACKING_EVENTS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_EVENTS));
      return INITIAL_DEMO_EVENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_DEMO_EVENTS;
  } catch (e) {
    console.error('Failed reading affiliate tracking events:', e);
    return INITIAL_DEMO_EVENTS;
  }
}

export function recordAffiliateImpression(
  offerId: string,
  placement: string,
  matchScore: number,
  userId?: string,
  opportunityId?: string
): void {
  try {
    const events = getStoredEvents();
    // Throttle duplicate impression events in same session
    const recent = events.find(
      (e) => e.eventType === 'impression' && e.offerId === offerId && e.placement === placement && Date.now() - new Date(e.timestamp).getTime() < 30000
    );
    if (recent) return;

    const newEvent: AffiliateTrackingEvent = {
      id: `evt-imp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      eventType: 'impression',
      offerId,
      placement,
      matchScore,
      userId,
      opportunityId,
      timestamp: new Date().toISOString()
    };
    events.push(newEvent);
    localStorage.setItem(TRACKING_EVENTS_STORAGE_KEY, JSON.stringify(events));
  } catch (e) {
    console.error('Failed recording affiliate impression:', e);
  }
}

export function recordAffiliateClick(
  offerId: string,
  placement: string,
  matchScore: number,
  userId?: string,
  opportunityId?: string
): void {
  try {
    const events = getStoredEvents();
    const newEvent: AffiliateTrackingEvent = {
      id: `evt-clk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      eventType: 'click',
      offerId,
      placement,
      matchScore,
      userId,
      opportunityId,
      timestamp: new Date().toISOString()
    };
    events.push(newEvent);
    localStorage.setItem(TRACKING_EVENTS_STORAGE_KEY, JSON.stringify(events));
  } catch (e) {
    console.error('Failed recording affiliate click:', e);
  }
}

export function getAffiliatePerformanceStats(): AffiliatePerformanceStats {
  const events = getStoredEvents();
  const allOffers = getStoredAffiliateOffers();
  const activeOffers = allOffers.filter((o) => o.status === 'Active');

  const impressions = events.filter((e) => e.eventType === 'impression');
  const clicks = events.filter((e) => e.eventType === 'click');

  const totalImpressions = impressions.length;
  const totalClicks = clicks.length;
  const clickThroughRate = totalImpressions > 0 
    ? Math.round((totalClicks / totalImpressions) * 1000) / 10 
    : 0;

  // Breakdown by offer
  const offerStatsMap: Record<string, { impressions: number; clicks: number }> = {};
  allOffers.forEach((o) => {
    offerStatsMap[o.id] = { impressions: 0, clicks: 0 };
  });

  impressions.forEach((e) => {
    if (offerStatsMap[e.offerId]) {
      offerStatsMap[e.offerId].impressions += 1;
    }
  });

  clicks.forEach((e) => {
    if (offerStatsMap[e.offerId]) {
      offerStatsMap[e.offerId].clicks += 1;
    }
  });

  const topPerformingOffers = allOffers
    .map((o) => {
      const imps = offerStatsMap[o.id]?.impressions || 0;
      const clks = offerStatsMap[o.id]?.clicks || 0;
      const ctr = imps > 0 ? Math.round((clks / imps) * 1000) / 10 : 0;
      return {
        offerId: o.id,
        partnerName: o.partnerName,
        title: o.title,
        impressions: imps,
        clicks: clks,
        ctr
      };
    })
    .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions);

  // Breakdown by placement
  const placementMap: Record<string, { impressions: number; clicks: number }> = {};
  events.forEach((e) => {
    const p = e.placement || 'unknown';
    if (!placementMap[p]) {
      placementMap[p] = { impressions: 0, clicks: 0 };
    }
    if (e.eventType === 'impression') {
      placementMap[p].impressions += 1;
    } else if (e.eventType === 'click') {
      placementMap[p].clicks += 1;
    }
  });

  const placementsBreakdown = Object.entries(placementMap).map(([placement, data]) => ({
    placement,
    impressions: data.impressions,
    clicks: data.clicks,
    ctr: data.impressions > 0 ? Math.round((data.clicks / data.impressions) * 1000) / 10 : 0
  })).sort((a, b) => b.impressions - a.impressions);

  return {
    totalOffers: allOffers.length,
    activeOffers: activeOffers.length,
    totalImpressions,
    totalClicks,
    clickThroughRate,
    topPerformingOffers,
    placementsBreakdown
  };
}

export function clearAffiliateTrackingData(): void {
  try {
    localStorage.setItem(TRACKING_EVENTS_STORAGE_KEY, JSON.stringify([]));
  } catch (e) {
    console.error('Failed clearing tracking data:', e);
  }
}
