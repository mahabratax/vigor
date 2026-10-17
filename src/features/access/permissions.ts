import type { Action } from '../../domain/actions';
export const ROLES = ['Owner', 'Manager', 'Operator', 'Viewer'] as const;
export type Role = (typeof ROLES)[number];
export const permissions = [
  {
    id: 'monitoring',
    label: 'Monitoring & costs',
    detail: 'View zones, sensors, cameras, activity, and expenses.',
  },
  {
    id: 'inspection',
    label: 'Record inspection',
    detail: 'Assign operators and record plant inspections.',
  },
  {
    id: 'control',
    label: 'Review pest management',
    detail: 'Create, approve, and evaluate control plans.',
  },
  {
    id: 'run',
    label: 'Run operations',
    detail: 'Start or stop reviewed routines.',
  },
  {
    id: 'automation',
    label: 'Configure automation',
    detail: 'Edit schedules, steps, operating limits, and nutrient profiles.',
  },
  {
    id: 'devices',
    label: 'Manage devices',
    detail: 'Add, validate, and configure devices.',
  },
  {
    id: 'maintenance',
    label: 'Record maintenance',
    detail: 'Record maintenance work without recording a payment.',
  },
  {
    id: 'finance',
    label: 'Manage finances',
    detail: 'Record expenses, sales, receipts, budgets, and cycle profit reviews.',
  },
  {
    id: 'cultivation',
    label: 'Record crop care & harvests',
    detail: 'Record plant populations, field tasks, care, harvests, and produce losses.',
  },
  {
    id: 'crop_review',
    label: 'Review cycles & lots',
    detail: 'Manage batches, crop details, and targets; review harvests and close cycles.',
  },
  {
    id: 'export',
    label: 'Export reports',
    detail: 'Download records or print operations reports.',
  },
  { id: 'team', label: 'Manage members', detail: 'Edit local team roles and greenhouse access.' },
  {
    id: 'greenhouse_edit',
    label: 'Edit greenhouse',
    detail:
      'Manage greenhouse profiles, zones, capacity, and growing methods within your access scope.',
  },
  {
    id: 'greenhouse_manage',
    label: 'Add & delete greenhouses',
    detail: 'Create an empty greenhouse or delete it and its linked records after confirmation.',
  },
] as const;
export type Permission = (typeof permissions)[number]['id'];
const grants: Record<Role, readonly Permission[]> = {
  Owner: permissions.map((p) => p.id),
  Manager: permissions
    .filter((p) => p.id !== 'team' && p.id !== 'greenhouse_manage')
    .map((p) => p.id),
  Operator: ['monitoring', 'inspection', 'run', 'maintenance', 'cultivation', 'export'],
  Viewer: ['monitoring'],
};
export const can = (role: Role, permission: Permission) => grants[role].includes(permission);
export function actionPermission(action: Action): Permission | null {
  switch (action.type) {
    case 'target_save':
    case 'target_activate':
      return 'crop_review';
    case 'outcome_capture':
    case 'outcome_review':
      return 'cultivation';
    case 'supply_item':
    case 'supply_archive':
      return 'devices';
    case 'supply_move':
    case 'supply_reverse':
      return 'maintenance';
    case 'supply_link_expense':
    case 'resource_extra':
    case 'resource_void':
    case 'resource_review':
      return 'finance';
    case 'energy_save':
      return 'finance';
    case 'zone_save':
    case 'zone_status':
    case 'zone_delete':
      return 'greenhouse_edit';
    case 'zone_devices':
      return 'devices';
    case 'planting_save':
    case 'planting_close':
      return 'crop_review';
    case 'planting_count':
      return 'cultivation';
    case 'assistant_task':
    case 'crop_task':
    case 'crop_task_done':
    case 'crop_harvest':
    case 'crop_loss':
      return 'cultivation';
    case 'crop_setup':
    case 'crop_release':
    case 'crop_lot_void':
    case 'crop_close':
    case 'crop_reopen':
    case 'crop_sample':
      return 'crop_review';
    case 'clear_notice':
      return null;
    case 'speed':
      return 'run';
    case 'play':
      return action.value ? 'run' : null;
    case 'assign':
    case 'evaluate_detection':
    case 'inspection':
      return 'inspection';
    case 'plan':
    case 'approve_plan':
    case 'evaluate_plan':
      return 'control';
    case 'tick':
    case 'next':
    case 'start_plan':
    case 'plan_task':
    case 'run_once':
    case 'approve_run':
    case 'stop':
    case 'stop_all':
    case 'reconcile':
      return 'run';
    case 'routine_toggle':
    case 'routine_activate':
    case 'routine_save':
    case 'skip_once':
    case 'profile_review':
    case 'override':
    case 'scenario':
    case 'detection_sample':
    case 'profile':
    case 'reset':
      return 'automation';
    case 'heal':
    case 'maintenance_mode':
    case 'deactivate_device':
    case 'validate_zone':
    case 'add_device':
      return 'devices';
    case 'maintenance':
      return action.paid && (action.amount ?? 0) > 0 ? 'finance' : 'maintenance';
    case 'maintenance_complete':
      return 'maintenance';
    default:
      return 'finance';
  }
}
export function modalPermission(kind: string): Permission | null {
  const map: Record<string, Permission> = {
    inspection: 'inspection',
    plan: 'control',
    'approve-plan': 'control',
    'start-plan': 'run',
    evaluate: 'control',
    'activate-routine': 'automation',
    'nutrition-profile': 'automation',
    deactivate: 'devices',
    'remove-baseline': 'finance',
    'run-once': 'run',
    reconcile: 'run',
    override: 'automation',
    'profile-review': 'automation',
    'device-create': 'devices',
    'validate-zone': 'devices',
    'maintenance-mode': 'devices',
    maintenance: 'maintenance',
    expense: 'finance',
    'expense-edit': 'finance',
    'void-expense': 'finance',
    budget: 'finance',
    baseline: 'finance',
    planner: 'finance',
    'stop-all': 'run',
    scenario: 'automation',
    reset: 'automation',
    report: 'export',
  };
  return map[kind] ?? null;
}
