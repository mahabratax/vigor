// @vitest-environment jsdom
import React, { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Button, Field, FormBox, Modal, Tabs } from '../src/components/ui';

let host: HTMLDivElement, root: Root;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

it('focuses a rejected form without losing input and allows a corrected submission only once', async () => {
  const save = vi.fn((data: FormData) => ({
    ok: Number(data.get('qty')) <= 10,
    message: 'Jumlah melebihi 10 kg stok tersedia. Kurangi jumlah penjualan.',
  }));
  await act(async () =>
    root.render(
      <FormBox onSubmit={save}>
        <Field label="Jumlah penjualan">
          <input name="qty" type="number" defaultValue="12" />
        </Field>
        <Button type="submit">Save sale</Button>
      </FormBox>,
    ),
  );
  const form = host.querySelector('form')!;
  const input = host.querySelector('input')!;
  const submit = async () =>
    act(async () => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  await submit();
  expect(document.activeElement).toBe(host.querySelector('[role="alert"]'));
  expect(input.value).toBe('12');
  expect(host.textContent).toContain('Kurangi jumlah penjualan');
  input.value = '10';
  await submit();
  expect(host.querySelector('[role="alert"]')).toBeNull();
  await submit();
  expect(save).toHaveBeenCalledTimes(2);
});

it('gives concurrent dialogs independent names and restores the opener on close', async () => {
  function Example() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>Review biaya</button>
        {open && (
          <>
            <Modal
              title={'Review cycle costs'}
              description="Periksa porsi biaya."
              onClose={() => setOpen(false)}
            >
              <p>Biaya operasional</p>
            </Modal>
            <Modal title="Konfirmasi perubahan" onClose={() => setOpen(false)}>
              <p>Catatan penyesuaian</p>
            </Modal>
          </>
        )}
      </>
    );
  }
  await act(async () => root.render(<Example />));
  const opener = host.querySelector('button')!;
  opener.focus();
  await act(async () => opener.click());
  const dialogs = [...host.querySelectorAll('dialog')];
  expect(dialogs).toHaveLength(2);
  const names = dialogs.map(
    (dialog) => document.getElementById(dialog.getAttribute('aria-labelledby')!)?.textContent,
  );
  expect(names).toEqual(['Review cycle costs', 'Konfirmasi perubahan']);
  expect(document.getElementById(dialogs[0].getAttribute('aria-describedby')!)?.textContent).toBe(
    'Periksa porsi biaya.',
  );
  await act(async () => dialogs[1].dispatchEvent(new Event('cancel', { cancelable: true })));
  expect(host.querySelector('dialog')).toBeNull();
  expect(document.activeElement).toBe(opener);
});

it('keeps field help available to assistive technology alongside an existing description', async () => {
  await act(async () =>
    root.render(
      <>
        <p id="price-source">Harga dalam rupiah.</p>
        <Field label="Harga jual" hint="Gunakan harga per kilogram.">
          <input name="price" aria-describedby="price-source" />
        </Field>
      </>,
    ),
  );
  const ids = host.querySelector('input')!.getAttribute('aria-describedby')!.split(' ');
  expect(ids.map((id) => document.getElementById(id)?.textContent)).toEqual([
    'Harga dalam rupiah.',
    'Gunakan harga per kilogram.',
  ]);
});

it('lets keyboard users move tabs without submitting the surrounding form', async () => {
  const submit = vi.fn();
  function Example() {
    const [tab, setTab] = useState('care');
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Tabs
          label={'Crop cycle'}
          value={tab}
          onChange={setTab}
          items={[
            { id: 'care', label: 'Maintenance' },
            { id: 'harvest', label: 'Harvest' },
            { id: 'sales', label: 'Sales' },
          ]}
        />
      </form>
    );
  }
  await act(async () => root.render(<Example />));
  const tabs = host.querySelectorAll<HTMLButtonElement>('[role="tab"]');
  await act(async () => tabs[1].click());
  expect(tabs[1].getAttribute('aria-selected')).toBe('true');
  await act(async () =>
    tabs[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true })),
  );
  expect(document.activeElement).toBe(tabs[2]);
  expect(tabs[2].getAttribute('aria-selected')).toBe('true');
  expect(submit).not.toHaveBeenCalled();
});
