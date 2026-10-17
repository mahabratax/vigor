/** HTTP-origin smoke tests to run locally after npm installation.
 * Not executed here; tests/browser-smoke.py covers the embedded portable UI.
 */
import { test, expect } from '@playwright/test';
test('eight destinations and September totals', async ({ page }) => {
  for (const route of [
    'ringkasan',
    'greenhouse',
    'hama',
    'pengendalian',
    'otomasi',
    'devices',
    'riwayat',
    'biaya',
  ]) {
    await page.goto('/#/' + route);
    await expect(page.locator('main h1')).toBeVisible();
  }
  await expect(
    page.locator('main').getByText('Rp 1.080.000', { exact: true }).first(),
  ).toBeVisible();
});
test('pump cost detail preserves expense scope', async ({ page }) => {
  await page.goto('/#/perangkat?device=PUMP-01&period=2026-09&detailTab=cost');
  await expect(page.locator('main').getByText('Rp 85.500', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'View expenses', exact: true }).click();
  await expect(page).toHaveURL(/device=PUMP-01/);
  await expect(page.locator('main')).toContainText('EXP-003');
  await expect(page.locator('main')).toContainText('EXP-005');
});
