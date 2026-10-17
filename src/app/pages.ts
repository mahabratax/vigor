import type { IconName } from '../components/ui';
export const navItems: {
  path: string;
  label: string;
  icon: IconName;
  subtitle: string;
}[] = [
  {
    path: '/ringkasan',
    label: 'Dashboard',
    icon: 'home',
    subtitle: "Crop conditions and today's work.",
  },
  {
    path: '/greenhouse',
    label: 'Greenhouse',
    icon: 'greenhouse',
    subtitle: 'Growing zones, monitoring coverage, and devices.',
  },
  {
    path: '/hama',
    label: 'Pests & inspections',
    icon: 'bug',
    subtitle: 'Camera observations and field inspection findings.',
  },
  {
    path: '/pengendalian',
    label: 'Pest management',
    icon: 'shield',
    subtitle: 'Case actions, execution, and follow-up review.',
  },
  {
    path: '/siklus',
    label: 'Crop cycle',
    icon: 'leaf',
    subtitle: 'Crop care, staged harvests, produce stock, and sales.',
  },
  {
    path: '/otomasi',
    label: 'Automation',
    icon: 'workflow',
    subtitle: 'Schedules, rules, and execution records.',
  },
  {
    path: '/perangkat',
    label: 'Devices',
    icon: 'devices',
    subtitle: 'Asset connectivity, usage, maintenance, and costs.',
  },
  {
    path: '/riwayat',
    label: 'Activity & reports',
    icon: 'history',
    subtitle: 'Greenhouse activity records and reports.',
  },
  {
    path: '/biaya',
    label: 'Costs & savings',
    icon: 'wallet',
    subtitle: 'Period expenses and baseline comparisons.',
  },
  {
    path: '/akses',
    label: 'Roles & permissions',
    icon: 'users',
    subtitle: 'Team members, greenhouse access, and role permissions.',
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: 'settings',
    subtitle: 'Profile, workspace appearance, and notifications.',
  },
];
