export interface SupplyItem {
  id: string;
  name: string;
  unit: 'L' | 'kg' | 'pcs';
  category: 'Air' | 'Nutrisi' | 'Perawatan';
  reorderAt: number;
  deviceId: string;
  autoTask: boolean;
  operator: string;
  active: boolean;
}
export interface SupplyMovement {
  id: string;
  itemId: string;
  kind: 'in' | 'use' | 'waste' | 'reversal';
  quantity: number;
  date: string;
  notes: string;
  actor: string;
  key: string;
  expenseId?: string;
  runId?: string;
  maintenanceId?: string;
  reverses?: string;
}
export interface SupplyState {
  version: 1;
  items: SupplyItem[];
  movements: SupplyMovement[];
}
export type SupplyAction =
  | { type: 'supply_item'; id?: string; item: Omit<SupplyItem, 'id' | 'active'>; actor?: string }
  | { type: 'supply_archive'; id: string; actor?: string }
  | {
      type: 'supply_move';
      itemId: string;
      kind: 'in' | 'use' | 'waste';
      quantity: number;
      date: string;
      notes: string;
      key: string;
      expenseId?: string;
      runId?: string;
      maintenanceId?: string;
      actor?: string;
    }
  | { type: 'supply_reverse'; id: string; notes: string; key: string; actor?: string }
  | { type: 'supply_link_expense'; id: string; expenseId: string; actor?: string };
