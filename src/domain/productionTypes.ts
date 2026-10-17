import type { ZoneId } from './types';
export type Grade = 'A' | 'B';
export interface CareTask {
  plantingId?: string;
  id: string;
  title: string;
  zoneId: ZoneId;
  dueOn: string;
  operator: string;
  status: 'pending' | 'done';
  notes: string;
  completedOn?: string;
  key: string;
}
export interface HarvestLot {
  plantingId?: string;
  crop?: string;
  variety?: string;
  id: string;
  date: string;
  zoneId: ZoneId;
  grossKg: number;
  aKg: number;
  bKg: number;
  rejectedKg: number;
  notes: string;
  operator: string;
  status: 'held' | 'released' | 'void';
  reviewNotes?: string;
  reviewedOn?: string;
  key: string;
}
export interface CropSale {
  id: string;
  lotId: string;
  grade: Grade;
  kg: number;
  price: number;
  date: string;
  dueOn: string;
  buyer: string;
  status: 'recorded' | 'void';
  key: string;
}
export interface CropReceipt {
  id: string;
  saleId: string;
  date: string;
  amount: number;
  reference: string;
  key: string;
}
export interface StockLoss {
  id: string;
  lotId: string;
  grade: Grade;
  kg: number;
  date: string;
  reason: string;
  key: string;
}
export interface ProductionState {
  version: 1;
  cycleId: string;
  stage: 'growing' | 'harvesting' | 'closed';
  targetOn: string;
  targetKg: number | null;
  targetPrice: number | null;
  operator: string;
  tasks: CareTask[];
  lots: HarvestLot[];
  sales: CropSale[];
  receipts: CropReceipt[];
  losses: StockLoss[];
  expenseShares: Record<string, number>;
  finance: {
    depreciation: number | null;
    unpaidLabor: number | null;
    otherAccrued: number | null;
    baselineCost: number | null;
    notes: string;
    reviewKey: string | null;
  };
  closedOn?: string;
  closingNotes?: string;
}
export type ProductionAction =
  | {
      type: 'crop_setup';
      targetOn: string;
      targetKg: number | null;
      targetPrice: number | null;
      operator: string;
    }
  | { type: 'crop_task'; task: Omit<CareTask, 'id' | 'status' | 'notes' | 'completedOn'> }
  | { type: 'crop_task_done'; id: string; notes: string }
  | { type: 'crop_harvest'; lot: Omit<HarvestLot, 'id' | 'status' | 'reviewNotes' | 'reviewedOn'> }
  | { type: 'crop_release'; id: string; notes: string }
  | { type: 'crop_lot_void'; id: string; notes: string }
  | { type: 'crop_sale'; sale: Omit<CropSale, 'id' | 'status'> }
  | { type: 'crop_sale_void'; id: string; notes: string }
  | { type: 'crop_receipt'; receipt: Omit<CropReceipt, 'id'> }
  | { type: 'crop_loss'; loss: Omit<StockLoss, 'id'> }
  | {
      type: 'crop_costs';
      shares: Record<string, number>;
      depreciation: number | null;
      unpaidLabor: number | null;
      otherAccrued: number | null;
      baselineCost: number | null;
      notes: string;
      reviewed: boolean;
    }
  | { type: 'crop_close'; notes: string }
  | { type: 'crop_reopen'; notes: string }
  | { type: 'crop_sample' };
