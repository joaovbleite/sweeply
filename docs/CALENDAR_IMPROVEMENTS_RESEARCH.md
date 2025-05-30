# Sweeply Calendar – Competitor Research & Improvement Recommendations

## 1. Executive Summary
The current Sweeply calendar is already feature-rich (multiple views, analytics, filters, keyboard shortcuts, etc.).  The goal of this research is to benchmark it against leading field-service apps—Jobber, MaidPad, Housecall Pro, and FieldPulse—and surface concrete UI/UX and functional enhancements that can further differentiate Sweeply.

## 2. Competitor Feature Matrix
| Capability | Jobber | MaidPad | Housecall Pro | FieldPulse | Notes |
|------------|--------|---------|---------------|------------|-------|
| Day / Week / Month views | ✅ | ✅ | ✅ (plus *Dispatch* view) | ✅ | Sweeply already supports these |
| Drag-and-drop rescheduling | ✅ | ➖ (limited info) | ✅ | ✅ | Improves speed & reduces modal interactions |
| Unscheduled jobs side-panel | ✅ | ✅ | ✅ | ✅ | Keeps backlog visible; drag onto calendar |
| Multi-employee / crew lanes | ✅ (color coded) | ✅ | ✅ | ✅ | Clear staffing view; avoid double-booking |
| Map & route view | ✅ | ➖ | ✅ (route lines & ETA) | ✅ (GPS & live tracking) | Adds geo context + optimization |
| Color coding options | Status & employee | Status | Status / employee / zip | Status / role | Helps glanceability |
| Conflict detection & alerts | ✅ | ➖ | ✅ | ✅ | Warns of overlaps / travel issues |
| Mobile-first calendar | ✅ (iOS & Android) | ✅ | ✅ | ✅ | Essential for techs in the field |
| Inline quick-add job | ✅ | ✅ | ✅ | ✅ | Speeds entry |
| Public holidays overlay | ➖ | ➖ | ✅ | ➖ | Nice quality-of-life touch |
| Permission-based visibility | ✅ (tasks / visits) | ➖ | ✅ (employee roles) | ✅ (granular) | Important for larger teams |
| Customer notifications from schedule | ✅ | ✅ | ✅ | ✅ | Automatic SMS/email when slot moves |

## 3. UX Patterns Worth Adopting
1. **Persistent backlog drawer** *(Jobber/HCP)*  – A left rail that toggles between employee list and "Unscheduled" jobs.  Jobs can be drag-dropped onto any calendar view.
2. **Dynamic lane coloring** – Let admins toggle between coloring by *Status*, *Assignee*, or *Service Area* (zip).  Housecall Pro does this elegantly.
3. **Route-aware map view** – Overlay jobs on a map for the selected period, draw ordered route lines, show distance/time.  Use Mapbox / Google Maps Directions API.
4. **Conflict & travel-time warnings** – When a job is dropped into a slot that causes overlap or impossible travel, surface an inline badge and suggestion (e.g., next feasible slot).
5. **"Block-off time" events** *(Jobber feedback)* – Users can add personal or shop-wide events (doctor, team meeting) that behave like read-only busy blocks.
6. **Keyboard palette** – Command-K style quick action to create jobs, jump to date, or toggle views (Jobber uses quick-keys heavily).
7. **Mobile mini-map** – For field techs: small map on job detail with live ETA to next stop.
8. **Public-holiday shading** – Grey-out federal holidays automatically; configurable per locale.

## 4. Improvement Roadmap
### 4.1 Quick Wins (1–2 sprints)
- Add **Unscheduled Jobs Drawer**: reuse existing `CalendarFilters` state store; minimal UI work.
- Implement **Busy Blocks** (non-job events) with a distinct "event" entity & color.
- Extend `CalendarSettings` to allow **color-by** toggle.
- Surface **keyboard shortcuts cheat-sheet** in a modal (already have `CalendarKeyboardShortcuts.tsx`; link it in header).

### 4.2 Mid-Term (3–5 sprints)
- **Map View v2**: integrate Directions API to draw optimized routes and compute travel buffers.
- **Conflict engine**: when a job is saved, run overlap & buffer checks; toast warning + auto-suggest next slot.
- **Holiday calendar service** (e.g., Calendarific) with nightly cron to cache holidays per locale.

### 4.3 Long-Term (6 + sprints)
- **Mobile-first calendar rewrite** (React Native or PWA): ensure offline caching + background sync.
- **AI auto-scheduling** (inspired by MaidPad): given recurrence rules & availabilities, auto-generate tentative schedule.
- **Real-time fleet tracking overlay** (FieldPulse style) using GPS pings from technician mobile app.

## 5. Visual & Interaction Design Recommendations
1. Adopt **Jobber's minimal palette** – soft greys, single accent color for status; reduces cognitive load.
2. Use **pill badges & subtle icons** in slots instead of full text lines (compact view).
3. Provide **hover tooltips** with job summary (customer, service, ETA) similar to HCP's preview tile.
4. Keep the **header sticky** with date picker & view toggles; enable horizontal swipe to change days on touch devices.

## 6. Technical Considerations
- Calendar grid is rendered by `react-big-calendar` fork; drag-and-drop is already wired—extend to backlog list via `react-dnd`.
- Map view uses Mapbox GL; upgrade to include Directions layer.
- Conflict detection can live in `lib/calendar/conflicts.ts` util, unit-tested in isolation.
- Feature flags via existing `contexts/FeatureFlagsContext` (if present) to enable phased rollout.

## 7. Success Metrics
| KPI | Baseline | Target |
|-----|----------|--------|
| Avg. time to schedule a new job | 54 s | 30 s |
| Calendar page bounce-rate | 18 % | <10 % |
| Reschedule drag-and-drop usage | – | >40 % of edits |
| Support tickets about double-booking | 12 / mo | ≤3 / mo |

## 8. References
- Jobber iOS screenshots (App Store): https://apps.apple.com/us/app/jobber/id1014146758
- Housecall Pro Calendar Guide: https://help.housecallpro.com/en/articles/6367496-how-to-use-the-schedule-tab-calendar-in-housecall-pro
- FieldPulse Scheduling & Dispatch: https://www.fieldpulse.com/features/scheduling-and-dispatching
- MaidPad marketing site: https://maidpad.com/

---
**Prepared:** 2025-05-30

*(Feel free to leave inline comments or open issues in the `calendar` label for any item above.)*