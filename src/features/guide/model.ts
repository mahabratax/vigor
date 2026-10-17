import type { DomainState } from '../../domain/types';
import type { Permission } from '../access/permissions';
import type { IconName } from '../../components/ui';

export const TOUR_IDS = ['presentation', 'workspace', 'setup', 'daily', 'harvest'] as const;
export type TourId = (typeof TOUR_IDS)[number];
export interface TourProgress {
  step: string;
  seen: string[];
  finished: boolean;
}
export interface GuidePreferences {
  progress: Record<string, Partial<Record<TourId, TourProgress>>>;
  dismissed: string[];
}
export interface TourStep {
  id: string;
  title: string;
  text: string;
  access: string;
  route: string;
  target: string;
  timing?: string;
  permission?: Permission;
}
export interface Tour {
  id: TourId;
  title: string;
  description: string;
  icon: IconName;
  steps: TourStep[];
}
export function tours(s: DomainState): Tour[] {
  const zone = s.zones.find((z) => z.status !== 'inactive')?.id ?? s.zones[0]?.id;
  const zonePath = `/greenhouse?tab=zones${zone ? `&zone=${encodeURIComponent(zone)}` : ''}`;
  return [
    {
      id: 'presentation',
      title: '3-minute walkthrough',
      description:
        'Rehearse one workflow, from a greenhouse finding to harvest and business results.',
      icon: 'play',
      steps: [
        {
          id: 'context',
          title: 'One greenhouse, connected records',
          timing: '0:00–0:15',
          text: 'Select a zone to introduce its crops and assets. Use 2D for a reliable walkthrough. These are saved prototype records, not a live camera or sensor feed.',
          access: 'Greenhouse → Monitoring → select a zone',
          route: '/greenhouse?tab=monitoring&view=2d',
          target: '[data-tour="greenhouse-map"]',
        },
        {
          id: 'assistant',
          title: 'A question leads to a next action',
          timing: '0:15–0:50',
          text: 'Select Try on page, open the assistant and ask what needs attention. Expand Sources & next steps, then open a source. Local records is a bounded lookup. Only call the answer Gemini when that mode returns a real analysis.',
          access: 'Dashboard → Vigor assistant → Local records',
          route: '/ringkasan',
          target: '[data-tour="assistant"]',
        },
        {
          id: 'evidence',
          title: 'Check the finding before acting',
          timing: '0:50–1:15',
          text: 'Review the observation and its data-quality checks. Missing or expired readings need a new check. An inspection supports a case review; it does not prove recovery.',
          access: 'Pests & inspections → Detection review',
          route: '/hama?tab=detection',
          target: '[data-tour="inspection-review"]',
        },
        {
          id: 'care',
          title: 'Follow the work through',
          timing: '1:15–1:35',
          text: 'Show an existing care task and its outcome. The task stays linked to the zone and crop cycle. Completing work does not automatically close a case or release a harvest lot.',
          access: 'Crop cycle → Care & pests',
          route: '/siklus?tab=care',
          target: '[data-tour="plant-care"]',
        },
        {
          id: 'harvest',
          title: 'Keep harvest release a separate review',
          timing: '1:35–2:00',
          text: 'Open a harvest lot and review its grade, quantity and release status. An unresolved case may hold the lot. Available stock, sales and buyer payments remain separate records.',
          access: 'Crop cycle → Harvest & stock',
          route: '/siklus?tab=harvest',
          target: '[data-tour="harvest-lots"]',
        },
        {
          id: 'profit',
          title: 'Explain the business result',
          timing: '2:00–2:20',
          text: 'Show sales and allocated costs for the same crop cycle. Identify any missing costs. Receipts show cash collected; savings are not added again as revenue.',
          access: 'Costs & savings → Cycle profit',
          route: '/biaya?tab=profit',
          target: '[data-tour="cycle-profit"]',
        },
        {
          id: 'impact',
          title: 'Measure impact per kilogram',
          timing: '2:20–2:40',
          text: 'Review water and energy allocations alongside harvest output. Explain coverage and assumptions. Prototype values demonstrate the calculation, not proven field savings.',
          access: 'Costs & savings → Harvest efficiency',
          route: '/biaya?tab=efficiency',
          target: '[data-tour="harvest-efficiency"]',
        },
        {
          id: 'readiness',
          title: 'Close with the actual runtime status',
          timing: '2:40–3:00',
          text: 'Show the model and hosting status on this deployment. Gemini and Google Cloud activation are pending until configured and tested. Device execution and shared cloud storage are future work.',
          access: 'Settings → AI integration',
          route: '/settings?tab=ai',
          target: '[data-tour="ai-readiness"]',
        },
      ],
    },
    {
      id: 'workspace',
      title: 'Explore the workspace',
      description: 'Select a greenhouse, read the Dashboard, and find your tools.',
      icon: 'home',
      steps: [
        {
          id: 'location',
          title: 'Check the selected greenhouse',
          text: 'The header shows the active location. Select its name to switch. Monitoring, work, and costs follow the selected greenhouse.',
          access: 'Header → greenhouse name',
          route: '/ringkasan',
          target: '[data-tour="greenhouse-switcher"]',
        },
        {
          id: 'dashboard',
          title: 'Start with crop conditions',
          text: 'Review zone status and data quality. Select a zone for details. Missing data does not mean plants are safe.',
          access: 'Menu → Dashboard → zone monitoring',
          route: '/ringkasan',
          target: '[data-tour="zone-monitoring"]',
        },
        {
          id: 'map',
          title: 'Open details from the plan',
          text: 'Select a zone or asset for its details and actions. The 2D plan works on phones; choose 3D when supported.',
          access: 'Menu → Greenhouse → Monitoring',
          route: '/greenhouse?tab=monitoring&view=2d',
          target: '[data-tour="greenhouse-map"]',
        },
        {
          id: 'notifications',
          title: 'Find what needs review',
          text: 'Open the bell for notifications. Select one to open its record. Marking it read does not complete the work.',
          access: 'Header → Notifications',
          route: '/ringkasan',
          target: '[data-tour="notifications"]',
        },
        {
          id: 'preferences',
          title: 'Adjust appearance and find help',
          text: 'Settings stores your theme and layout preferences. Reopen the Vigor guide from the account menu at the bottom of the sidebar. On mobile, open Menu first.',
          access: 'Account menu → Settings / Vigor guide',
          route: '/settings?tab=appearance',
          target: '[data-tour="workspace-appearance"]',
        },
      ],
    },
    {
      id: 'setup',
      title: 'Set up a greenhouse',
      description: 'Set up locations, zones, crops, devices, and routines.',
      icon: 'greenhouse',
      steps: [
        {
          id: 'greenhouse',
          title: 'Manage greenhouse locations',
          text: 'Choose a location. Owners can add locations; Managers can edit those within their access scope.',
          access: 'Greenhouse → Greenhouses',
          route: '/greenhouse?tab=manage',
          target: '[data-tour="greenhouse-register"]',
          permission: 'greenhouse_edit',
        },
        {
          id: 'plants',
          title: 'Set up zones and planting batches',
          text: 'Set zone area, beds, and capacity, then record crop, variety, stage, and plant count. History follows the same batch.',
          access: 'Greenhouse → Zones & crops → Crops',
          route: zonePath + '&panel=plants',
          target: '[data-tour="zone-plants"]',
          permission: 'crop_review',
        },
        {
          id: 'targets',
          title: 'Set monitoring targets',
          text: 'Enter reviewed ranges for this batch and stage. Save a draft, then activate it. Monitoring targets do not change automation schedules or doses.',
          access: 'Zone details → Crop targets',
          route: zonePath + '&panel=targets',
          target: '[data-tour="crop-targets"]',
          permission: 'crop_review',
        },
        {
          id: 'devices',
          title: 'Assign inventory to zones',
          text: 'Add devices and select their zones. Review status and installation. Registering inventory does not create sensor readings.',
          access: 'Devices → Inventory',
          route: '/perangkat?tab=inventory',
          target: '[data-tour="device-register"]',
          permission: 'devices',
        },
        {
          id: 'routines',
          title: 'Review rules before activation',
          text: 'Open a routine and review its trigger, devices, and limits. Activation applies to the reviewed version. Physical execution requires a connected controller and scheduler.',
          access: 'Automation → Routines',
          route: '/otomasi?tab=routines',
          target: '[data-tour="routine-register"]',
          permission: 'automation',
        },
      ],
    },
    {
      id: 'daily',
      title: 'Routines & maintenance',
      description: 'Review priorities, automated processes, findings, and field work.',
      icon: 'workflow',
      steps: [
        {
          id: 'priorities',
          title: 'Start with a question',
          text: 'Open Vigor assistant and choose a suggested question. It shows one next action; expand Sources & next steps when you need the evidence. Assign a follow-up, record the work and verify the source. Answers use local records while Gemini is disconnected.',
          access: 'Dashboard → Vigor assistant',
          route: '/ringkasan',
          target: '[data-tour="assistant"]',
        },
        {
          id: 'schedule',
          title: 'Review upcoming schedules',
          text: 'Review schedules and execution history. Configuration is saved in this browser; device execution requires a gateway and scheduler connection.',
          access: 'Automation → Schedule',
          route: '/otomasi?tab=schedule',
          target: '[data-tour="automation-schedule"]',
          permission: 'run',
        },
        {
          id: 'outcomes',
          title: 'Review execution reasons and results',
          text: 'Operations explains triggers, blocking conditions, and execution results. New runs can capture before-and-after readings; operators still assess the outcome.',
          access: 'Greenhouse → Operations → select routine',
          route: '/greenhouse?tab=operations',
          target: '[data-tour="operations-review"]',
        },
        {
          id: 'inspection',
          title: 'Review findings before control actions',
          text: 'Check observation quality and open the related case. Record an inspection, then create the control plan from that case to keep evidence linked.',
          access: 'Pests & inspections → Detection review / Cases',
          route: '/hama?tab=detection',
          target: '[data-tour="inspection-review"]',
          permission: 'inspection',
        },
        {
          id: 'care',
          title: 'Record plant care work',
          text: 'Select a zone, schedule, and operator. Record results after completing the work. Device tasks are listed under Maintenance.',
          access: 'Crop cycle → Care & pests',
          route: '/siklus?tab=care',
          target: '[data-tour="plant-care"]',
          permission: 'cultivation',
        },
        {
          id: 'maintenance',
          title: 'Complete device tasks',
          text: "Open a ticket's follow-up and record the outcome and any costs. Device status, work completion, and payments have separate records.",
          access: 'Devices → Maintenance',
          route: '/perangkat?tab=maintenance',
          target: '[data-tour="device-maintenance"]',
          permission: 'maintenance',
        },
        {
          id: 'supplies',
          title: 'Check stock before the next refill',
          text: 'Record incoming stock and usage. Low stock can create restock tasks. Link an existing expense to avoid recording a cost twice.',
          access: 'Devices → Supplies',
          route: '/perangkat?tab=supplies',
          target: '[data-tour="supplies"]',
          permission: 'maintenance',
        },
      ],
    },
    {
      id: 'harvest',
      title: 'From harvest to business results',
      description: 'Review harvests, sales, usage, and costs within one cycle.',
      icon: 'wallet',
      steps: [
        {
          id: 'harvest',
          title: 'Record output and review harvest lots',
          text: 'Weigh output by zone and separate grades from rejects. Review lots before sale. Open zone cases can hold their release.',
          access: 'Crop cycle → Harvest & stock',
          route: '/siklus?tab=harvest',
          target: '[data-tour="harvest-lots"]',
          permission: 'cultivation',
        },
        {
          id: 'sales',
          title: 'Separate sales from receipts',
          text: 'Record sales within available stock, then record buyer payments. A recorded sale may still be unpaid.',
          access: 'Crop cycle → Sales',
          route: '/siklus?tab=sales',
          target: '[data-tour="harvest-sales"]',
          permission: 'finance',
        },
        {
          id: 'expenses',
          title: 'Review recorded expenses',
          text: 'Select a period and review payment status. Service and supply purchases use the same expense records as Devices and Supplies.',
          access: 'Costs & savings → Expenses',
          route: '/biaya?tab=expenses',
          target: '[data-tour="expenses"]',
          permission: 'finance',
        },
        {
          id: 'efficiency',
          title: 'Review resource use per kg',
          text: 'Review water and energy allocations and their coverage. Ratios use reviewed grade A/B output after losses. Incomplete data stays clearly identified.',
          access: 'Costs & savings → Harvest efficiency',
          route: '/biaya?tab=efficiency',
          target: '[data-tour="harvest-efficiency"]',
          permission: 'finance',
        },
        {
          id: 'profit',
          title: 'Review costs before evaluating profit',
          text: 'Set cycle cost shares and review their allocation. Compare sales, receipts, and profit. Savings are not added again as revenue.',
          access: 'Costs & savings → Cycle profit',
          route: '/biaya?tab=profit',
          target: '[data-tour="cycle-profit"]',
          permission: 'finance',
        },
      ],
    },
  ];
}
export function recommendedTour(path: string): TourId {
  return ['/biaya', '/siklus'].includes(path)
    ? 'harvest'
    : ['/otomasi', '/hama', '/pengendalian', '/perangkat'].includes(path)
      ? 'daily'
      : path === '/greenhouse'
        ? 'setup'
        : 'workspace';
}
export function matchesTourRoute(path: string, query: URLSearchParams, route: string) {
  const [expected, search] = route.split('?');
  return (
    path === expected && [...new URLSearchParams(search)].every(([k, v]) => query.get(k) === v)
  );
}
export function loadGuides(value: unknown): GuidePreferences {
  const empty: GuidePreferences = { progress: {}, dismissed: [] };
  if (!value || typeof value !== 'object') return empty;
  const raw = value as Partial<GuidePreferences>;
  if (Array.isArray(raw.dismissed))
    empty.dismissed = raw.dismissed.filter((x) => typeof x === 'string').slice(-200);
  if (raw.progress && typeof raw.progress === 'object' && !Array.isArray(raw.progress))
    for (const [scope, records] of Object.entries(raw.progress).slice(-200)) {
      if (!records || typeof records !== 'object') continue;
      const clean: Partial<Record<TourId, TourProgress>> = {};
      for (const id of TOUR_IDS) {
        const record = records[id];
        if (
          record &&
          typeof record.step === 'string' &&
          Array.isArray(record.seen) &&
          typeof record.finished === 'boolean'
        )
          clean[id] = {
            step: record.step,
            seen: [...new Set(record.seen.filter((x) => typeof x === 'string'))].slice(0, 30),
            finished: record.finished,
          };
      }
      empty.progress[scope] = clean;
    }
  return empty;
}
