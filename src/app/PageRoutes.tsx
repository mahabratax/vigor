import React from 'react';
import { Route, Routes } from 'react-router';
import { Button } from '../components/ui';
import { Automation } from '../features/automation/Automation';
import { Control } from '../features/control/Control';
import Costs from '../features/costs/Costs';
import Devices from '../features/devices/Devices';
import { Greenhouse } from '../features/greenhouse/Greenhouse';
import HistoryPage from '../features/history/History';
import { Overview } from '../features/overview/Overview';
import { Pests } from '../features/pests/Pests';
import { Settings } from '../features/settings/Settings';
import { Access } from '../features/access/Access';
import { CropCycle } from '../features/cultivation/CropCycle';
import type { PageContext } from './context';
export function PageRoutes({ ctx, onLogout }: { ctx: PageContext; onLogout: () => void }) {
  return (
    <Routes>
      <Route path="/" element={<Overview {...ctx} />} />
      <Route path="/ringkasan" element={<Overview {...ctx} />} />
      <Route path="/greenhouse" element={<Greenhouse {...ctx} />} />
      <Route path="/hama" element={<Pests {...ctx} />} />
      <Route path="/pengendalian" element={<Control {...ctx} />} />
      <Route path="/siklus" element={<CropCycle key={ctx.s.greenhouse.id} ctx={ctx} />} />
      <Route path="/otomasi" element={<Automation {...ctx} />} />
      <Route path="/perangkat" element={<Devices ctx={ctx} />} />
      <Route path="/riwayat" element={<HistoryPage ctx={ctx} />} />
      <Route path="/biaya" element={<Costs ctx={ctx} />} />
      <Route path="/settings" element={<Settings ctx={ctx} onLogout={onLogout} />} />
      <Route path="/akses" element={<Access ctx={ctx} />} />
      <Route
        path="*"
        element={
          <div className="empty">
            <h2>Page not found</h2>
            <Button onClick={() => ctx.nav('/ringkasan')}>Return to Dashboard</Button>
          </div>
        }
      />
    </Routes>
  );
}
