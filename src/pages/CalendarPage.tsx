import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  CalendarPlus, 
  Search, 
  Filter, 
  Sparkles, 
  Clock, 
  Building2, 
  MapPin, 
  ExternalLink, 
  Bookmark, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown,
  Layers,
  Award,
  Bell,
  List,
  Grid,
  Info
} from 'lucide-react';
import { Opportunity, PageId } from '../types';
import { CalendarEvent, CalendarViewMode } from '../types/calendar';
import { 
  generateGoogleCalendarUrl, 
  generateICSContent, 
  downloadICSFile 
} from '../utils/calendarExportUtils';
import { calculateDeadlineStatus } from '../utils/deadlineUtils';
import { getSiteOrigin } from '../utils/seoUtils';
import { SEOHead } from '../components/seo/SEOHead';
import { SEOMetaData } from '../types/seo';
import { MilestonePlannerModal } from '../components/deadlines/MilestonePlannerModal';

interface CalendarPageProps {
  allOpportunities: Opportunity[];
  bookmarkedIds: Set<string>;
  onSelectOpportunity: (opportunity: Opportunity) => void;
  onNavigate: (page: PageId) => void;
  onToggleBookmark: (opportunity: Opportunity) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({
  allOpportunities,
  bookmarkedIds,
  onSelectOpportunity,
  onNavigate,
  onToggleBookmark,
}) => {
  // Navigation & View mode
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [trackedOnly, setTrackedOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'urgent_7' | 'upcoming_30'>('all');

  // Month navigation (current year & month)
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  // Selected opportunity for Milestone Planner modal
  const [milestoneOpportunity, setMilestoneOpportunity] = useState<Opportunity | null>(null);

  const origin = getSiteOrigin();
  const canonicalUrl = `${origin}/calendar`;

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    allOpportunities.forEach((opp) => {
      if (opp.category) set.add(opp.category);
    });
    return Array.from(set);
  }, [allOpportunities]);

  // Normalize opportunities to calendar events
  const allEvents = useMemo<CalendarEvent[]>(() => {
    return allOpportunities
      .filter((opp) => opp.deadline && !isNaN(new Date(opp.deadline).getTime()))
      .map((opp) => {
        const deadlineStatus = calculateDeadlineStatus(opp.deadline);
        return {
          id: `cal-${opp.id}`,
          opportunityId: opp.id,
          title: opp.title,
          slug: opp.slug,
          organization: opp.organization,
          date: opp.deadline,
          deadlineType: 'Application Deadline',
          category: opp.category,
          amountDisplayText: opp.amount?.displayText || 'Grant Funding',
          daysRemaining: deadlineStatus.daysRemaining,
          urgency: deadlineStatus.urgencyStatus,
          isTracked: bookmarkedIds.has(opp.id),
          applicationUrl: opp.applicationUrl,
          location: opp.location,
          type: opp.type,
        };
      });
  }, [allOpportunities, bookmarkedIds]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      if (trackedOnly && !event.isTracked) return false;

      if (selectedCategory !== 'all' && event.category !== selectedCategory) {
        return false;
      }

      if (urgencyFilter === 'urgent_7' && (event.daysRemaining > 7 || event.urgency === 'deadline_passed')) {
        return false;
      }

      if (urgencyFilter === 'upcoming_30' && (event.daysRemaining > 30 || event.urgency === 'deadline_passed')) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = event.title.toLowerCase().includes(q);
        const matchOrg = event.organization.toLowerCase().includes(q);
        const matchCat = event.category.toLowerCase().includes(q);
        if (!matchTitle && !matchOrg && !matchCat) return false;
      }

      return true;
    });
  }, [allEvents, trackedOnly, selectedCategory, urgencyFilter, searchQuery]);

  // Filtered opportunities list (for export)
  const filteredOpportunities = useMemo(() => {
    const oppIds = new Set(filteredEvents.map((e) => e.opportunityId));
    return allOpportunities.filter((opp) => oppIds.has(opp.id));
  }, [allOpportunities, filteredEvents]);

  // KPI calculations
  const closingThisWeekCount = useMemo(() => {
    return allEvents.filter((e) => e.daysRemaining <= 7 && e.urgency !== 'deadline_passed').length;
  }, [allEvents]);

  const closingThisMonthCount = useMemo(() => {
    return allEvents.filter((e) => e.daysRemaining <= 30 && e.urgency !== 'deadline_passed').length;
  }, [allEvents]);

  const trackedCount = useMemo(() => {
    return allEvents.filter((e) => e.isTracked).length;
  }, [allEvents]);

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Month grid matrix generator
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const lastDate = new Date(year, month + 1, 0).getDate(); // days in month
    const prevMonthLastDate = new Date(year, month, 0).getDate();

    const days: { dayNumber: number; dateStr: string; isCurrentMonth: boolean; events: CalendarEvent[] }[] = [];

    // Leading days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthLastDate - i;
      const prevDate = new Date(year, month - 1, d);
      const dateStr = prevDate.toISOString().split('T')[0];
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: false,
        events: filteredEvents.filter((e) => e.date === dateStr),
      });
    }

    // Days in current month
    for (let d = 1; d <= lastDate; d++) {
      const curDate = new Date(year, month, d);
      const dateStr = curDate.toISOString().split('T')[0];
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        events: filteredEvents.filter((e) => e.date === dateStr),
      });
    }

    // Trailing days from next month to complete 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      const dateStr = nextDate.toISOString().split('T')[0];
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: false,
        events: filteredEvents.filter((e) => e.date === dateStr),
      });
    }

    return days;
  }, [year, month, filteredEvents]);

  // Export handlers
  const handleExportICS = () => {
    const toExport = filteredOpportunities.length > 0 ? filteredOpportunities : allOpportunities;
    const icsContent = generateICSContent(toExport);
    downloadICSFile('FundEcho_Grant_Deadlines.ics', icsContent);
  };

  const handleExportTrackedICS = () => {
    const trackedOpps = allOpportunities.filter((o) => bookmarkedIds.has(o.id));
    if (trackedOpps.length === 0) return;
    const icsContent = generateICSContent(trackedOpps);
    downloadICSFile('FundEcho_My_Tracked_Grants.ics', icsContent);
  };

  const seoMetadata: SEOMetaData = {
    title: 'Global Grant Deadlines Calendar (2026) | FundEcho',
    description: 'Track, synchronize, and export application deadlines for verified global grants, scholarships, and fellowships with 1-click Google Calendar & iCal sync.',
    canonicalUrl: canonicalUrl,
    ogTitle: 'Global Grant Deadlines Calendar (2026) | FundEcho',
    ogDescription: 'Track, synchronize, and export application deadlines for verified global grants with Google Calendar and iCal sync.',
    ogType: 'website',
    robots: 'index, follow',
    keywords: [
      'grant deadlines calendar',
      'funding deadline tracker',
      'scholarship calendar 2026',
      'grant schedule export',
      'google calendar grants'
    ],
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 overflow-x-clip">
      {/* 0. SEO HEAD TAGS */}
      <SEOHead metadata={seoMetadata} />

      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <CalendarIcon className="w-4 h-4" />
            <span>Interactive Funding Calendar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Grant Deadlines & Milestone Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Synchronize verified deadlines to your personal Google Calendar, Apple Calendar, or Microsoft Outlook.
          </p>
        </div>

        {/* Global Calendar Export Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportICS}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs shadow-2xs transition-colors"
            title="Download iCalendar file with active deadlines"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Export .ICS (All)</span>
          </button>

          {trackedCount > 0 && (
            <button
              type="button"
              onClick={handleExportTrackedICS}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-xs shadow-2xs transition-colors"
              title="Download iCalendar file of my saved opportunities"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Export My Saved ({trackedCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. KPI METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Deadlines
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {allEvents.length}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Across verified programs
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Closing This Week
          </span>
          <div className="text-xl sm:text-2xl font-black text-rose-700 dark:text-rose-300">
            {closingThisWeekCount}
          </div>
          <span className="text-[11px] text-rose-600/80 dark:text-rose-400/80">
            Urgent application cutoffs
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Closing in 30 Days
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-800 dark:text-amber-300">
            {closingThisMonthCount}
          </div>
          <span className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
            Active application windows
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/40 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
            <Bookmark className="w-3 h-3" />
            My Saved Deadlines
          </span>
          <div className="text-xl sm:text-2xl font-black text-indigo-700 dark:text-indigo-300">
            {trackedCount}
          </div>
          <span className="text-[11px] text-indigo-600/80 dark:text-indigo-400/80">
            Tracked in your account
          </span>
        </div>
      </div>

      {/* 3. FILTER BAR & CONTROLS */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by grant name, funder, or keyword..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filters Group */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Tracked vs All Toggle */}
            <div className="inline-flex p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setTrackedOnly(false)}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  !trackedOnly
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Grants ({allEvents.length})
              </button>
              <button
                type="button"
                onClick={() => setTrackedOnly(true)}
                className={`px-3 py-1 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
                  trackedOnly
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Bookmark className="w-3 h-3" />
                <span>My Saved ({trackedCount})</span>
              </button>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Urgency Filter */}
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value as any)}
              className="text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Urgency Levels</option>
              <option value="urgent_7">Closing in 7 Days</option>
              <option value="upcoming_30">Closing in 30 Days</option>
            </select>

            {/* View Mode Toggle */}
            <div className="inline-flex p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-xs shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('month')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'month'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Month Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'timeline'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Agenda & Timeline List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CALENDAR VIEW RENDER */}
      {viewMode === 'month' ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-4 sm:p-6">
          {/* Month Navigation Controls */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {monthName}
              </h2>
              <button
                type="button"
                onClick={goToToday}
                className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 font-bold text-slate-700 dark:text-slate-300 transition-colors"
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={prevMonth}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 text-center font-bold text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider py-2 border-b border-slate-100 dark:border-slate-800">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Month Grid Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((cell, idx) => {
              const isToday = cell.dateStr === todayStr;
              return (
                <div
                  key={idx}
                  className={`min-h-[90px] sm:min-h-[120px] p-1.5 sm:p-2 rounded-2xl border transition-colors flex flex-col justify-between ${
                    cell.isCurrentMonth
                      ? isToday
                        ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-800 ring-2 ring-indigo-500/20'
                        : 'bg-white dark:bg-slate-850/60 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                      : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-100/50 dark:border-slate-850 text-slate-300 dark:text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold h-6 w-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : cell.isCurrentMonth
                          ? 'text-slate-700 dark:text-slate-300'
                          : 'text-slate-400 dark:text-slate-600'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {cell.events.length > 0 && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
                        {cell.events.length}
                      </span>
                    )}
                  </div>

                  {/* Event Chips */}
                  <div className="space-y-1 mt-1 overflow-y-auto max-h-[80px]">
                    {cell.events.slice(0, 3).map((event) => {
                      const opp = allOpportunities.find((o) => o.id === event.opportunityId);
                      return (
                        <div
                          key={event.id}
                          onClick={() => opp && onSelectOpportunity(opp)}
                          className={`text-[10px] sm:text-[11px] p-1 rounded-lg border font-semibold truncate cursor-pointer transition-all hover:scale-101 ${
                            event.urgency === 'closing_today' || event.urgency === 'closing_soon'
                              ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300'
                              : event.urgency === 'closing_this_week'
                              ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300'
                              : 'bg-indigo-50/80 dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-900/80 text-indigo-700 dark:text-indigo-300'
                          }`}
                          title={`${event.title} - ${event.organization}`}
                        >
                          <span className="truncate block">
                            {event.title}
                          </span>
                        </div>
                      );
                    })}

                    {cell.events.length > 3 && (
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block text-center">
                        +{cell.events.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* TIMELINE & AGENDA LIST VIEW */
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <Clock className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No Deadlines Matching Your Filter
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Try resetting filters or exploring other funding categories to see all active opportunities.
              </p>
              <button
                type="button"
                onClick={() => {
                  setTrackedOnly(false);
                  setSelectedCategory('all');
                  setUrgencyFilter('all');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((event) => {
                  const opp = allOpportunities.find((o) => o.id === event.opportunityId);
                  const googleCalUrl = opp ? generateGoogleCalendarUrl(opp) : '#';

                  return (
                    <div
                      key={event.id}
                      className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Left Meta & Title */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                              event.daysRemaining <= 3
                                ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                : event.daysRemaining <= 7
                                ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                            }`}
                          >
                            {event.daysRemaining === 0
                              ? 'Closing Today'
                              : event.daysRemaining === 1
                              ? '1 Day Left'
                              : `${event.daysRemaining} Days Left`}
                          </span>

                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                            {event.category}
                          </span>

                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            {event.amountDisplayText}
                          </span>
                        </div>

                        <div>
                          <h3 
                            onClick={() => opp && onSelectOpportunity(opp)}
                            className="text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                          >
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                            <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              {event.organization}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {event.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Timeline Actions */}
                      <div className="flex items-center gap-2 flex-wrap md:flex-nowrap shrink-0">
                        {/* Milestone Planner Button */}
                        <button
                          type="button"
                          onClick={() => opp && setMilestoneOpportunity(opp)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors"
                          title="Open Milestone Countdown & Task Planner"
                        >
                          <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>Milestones</span>
                        </button>

                        {/* Google Calendar Intent */}
                        <a
                          href={googleCalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs border border-indigo-200 dark:border-indigo-800 transition-colors"
                          title="Add deadline to Google Calendar"
                        >
                          <CalendarPlus className="w-3.5 h-3.5" />
                          <span>Google Cal</span>
                        </a>

                        {/* Direct View Opportunity */}
                        <button
                          type="button"
                          onClick={() => opp && onSelectOpportunity(opp)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
                        >
                          <span>View Details</span>
                        </button>

                        {/* Save / Bookmark Toggle */}
                        {opp && (
                          <button
                            type="button"
                            onClick={() => onToggleBookmark(opp)}
                            className={`p-2 rounded-xl border transition-colors ${
                              bookmarkedIds.has(opp.id)
                                ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
                            }`}
                            title={bookmarkedIds.has(opp.id) ? 'Saved' : 'Save opportunity'}
                          >
                            <Bookmark className={`w-4 h-4 ${bookmarkedIds.has(opp.id) ? 'fill-current' : ''}`} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* 5. MILESTONE PLANNER MODAL */}
      {milestoneOpportunity && (
        <MilestonePlannerModal
          isOpen={Boolean(milestoneOpportunity)}
          onClose={() => setMilestoneOpportunity(null)}
          opportunity={milestoneOpportunity}
          onNavigateToWorkspace={() => onNavigate('application-workspace')}
        />
      )}
    </div>
  );
};
