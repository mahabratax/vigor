"""Local embedded-document smoke tests; no external deployment or network.
Run with Python Playwright and a locally available Chromium executable.
The sandbox disallows URL navigation, so we use page.set_content for the
self-contained preview and an explicit in-memory storage adapter for UI tests.
Real-origin localStorage and the npm/React/Three build are NOT covered here.
"""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'Vigor-Preview.html').read_text().replace("if(location.search.includes('test=1'))","if(true)")
STORAGE="""<script>window.__testStorage=new Map();Object.defineProperty(window,'localStorage',{value:{getItem:k=>window.__testStorage.get(k)??null,setItem:(k,v)=>window.__testStorage.set(k,String(v)),removeItem:k=>window.__testStorage.delete(k),clear:()=>window.__testStorage.clear()}});</script>"""
RESULTS=[]
def record(name,success,detail=''):
 RESULTS.append({'check':name,'passed':bool(success),'detail':detail})
def check(page,name,fn):
 try:fn();record(name,True)
 except Exception as e:record(name,False,str(e)[:800])
def nav(page,url):
 page.evaluate('(url)=>{window.location.hash=url;}',url)
 page.wait_for_timeout(250)
def dispatch(page,a):return page.evaluate('(a)=>window.__VIGOR_TEST__.store.getState().dispatch(a)',a)
def state(page,expr):return page.evaluate('()=>{const s=window.__VIGOR_TEST__.store.getState().data;return '+expr+';}')
def expect(condition,message='Assertion failed'):
 if not condition:raise AssertionError(message)
def reset(page):
 page.locator('dialog[open] .modal-head button').first.click() if page.locator('dialog[open]').count() else None
 dispatch(page,{'type':'reset'});nav(page,'/ringkasan');page.wait_for_timeout(100)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':1050},device_scale_factor=1)
 page.set_default_timeout(2500);errors=[];requests=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('request',lambda req:requests.append(req.url))
 page.set_content(HTML.replace('<head>','<head>'+STORAGE),wait_until='load');page.wait_for_timeout(300)
 routes=['/ringkasan','/greenhouse','/hama','/pengendalian','/otomasi','/otomasi?tab=routines','/otomasi?tab=nutrition','/otomasi?tab=builder','/perangkat','/perangkat?tab=cameras','/perangkat?tab=maintenance','/riwayat','/riwayat?tab=report','/biaya','/biaya?tab=expenses','/biaya?tab=savings']
 for route in routes:
  before=len(errors);nav(page,route);record('Render '+route,len(errors)==before and bool(page.locator('main').inner_text().strip()),'; '.join(errors[before:]))
 def expense_link():
  nav(page,'/perangkat?device=PUMP-01&period=2026-09&detailTab=cost')
  expect('Rp 85.500' in page.locator('main').inner_text(),'Pump detail total')
  page.get_by_role('button',name='Lihat pengeluaran',exact=True).click();page.wait_for_timeout(120)
  expect('device=PUMP-01' in page.evaluate('location.hash'),'Device filter preserved')
  expect('EXP-003' in page.locator('main').inner_text() and 'EXP-005' in page.locator('main').inner_text(),'Both sources linked')
 check(page,'Pump → filtered expenses preserves September and references',expense_link)
 def maintenance():
  nav(page,'/perangkat?device=PUMP-01&period=2026-09&detailTab=cost')
  page.get_by_role('button',name='Catat perawatan',exact=True).click()
  dialog=page.locator('dialog[open]');dialog.locator('input[name=amount]').fill('50000');dialog.locator('input[name=paid]').check()
  dialog.get_by_role('button',name='Simpan catatan perawatan').click();page.wait_for_timeout(120)
  expect(page.locator('dialog[open]').count()==0,'Form closes after real action')
  expect(state(page,'s.expenses.length')==8,'One expense created')
  expect(state(page,"s.expenses.filter(e=>e.status==='paid'&&e.paidAt.startsWith('2026-09')).reduce((t,e)=>t+e.amount,0)")==1080000,'September unchanged')
  nav(page,'/biaya?tab=expenses&period=2026-10');expect('Rp 50.000' in page.locator('main').inner_text(),'Expense visible in October')
 check(page,'Maintenance form creates one October expense, September unchanged',maintenance)
 def inspection_plan():
  reset(page);nav(page,'/hama?case=INS-024')
  page.get_by_role('button',name='Catat inspeksi',exact=True).first.click();dialog=page.locator('dialog[open]')
  dialog.locator('input[name=affected]').fill('13');dialog.locator('textarea[name=notes]').fill('Inspeksi tanaman demo: dua tanaman menunjukkan gejala.')
  dialog.get_by_role('button',name='Simpan inspeksi').click();expect('Jumlah bergejala' in dialog.inner_text(),'Inline domain validation')
  dialog.locator('input[name=affected]').fill('2');dialog.get_by_role('button',name='Simpan inspeksi').click();page.wait_for_timeout(100)
  expect(state(page,"s.cases.find(c=>c.id==='INS-024').verified"),'Case verified')
  page.get_by_role('button',name='Buat rencana pengendalian').click();dialog=page.locator('dialog[open]')
  dialog.locator('select[name=kind]').select_option('simulator');dialog.get_by_role('button',name='Buat rencana untuk review').click();page.wait_for_timeout(100)
  expect(state(page,"s.plans[0].status")== 'awaiting_approval','New plan really awaiting approval')
  # Click the review button present on the selected plan.
  page.get_by_role('button',name='Review & setujui rencana').click();dialog=page.locator('dialog[open]');dialog.locator('input[type=checkbox]').check();dialog.get_by_role('button',name='Setujui rencana',exact=True).click();page.wait_for_timeout(100)
  page.get_by_role('button',name='Mulai simulasi',exact=True).click();dialog=page.locator('dialog[open]');dialog.locator('input[type=checkbox]').check();dialog.get_by_role('button',name='Mulai simulasi',exact=True).click();page.wait_for_timeout(100)
  dispatch(page,{'type':'play','value':False});dispatch(page,{'type':'tick','seconds':120});page.wait_for_timeout(100)
  expect(state(page,"s.runs[0].status")=='Completed','Pest simulation steps completed')
  expect(state(page,"s.plans[0].status")=='monitoring','Plan monitored, not case auto-closed')
 check(page,'Inspection validation → plan approval → simulator completion',inspection_plan)
 def automatic():
  reset(page);nav(page,'/otomasi?tab=executions');page.get_by_role('button',name='Ke kejadian berikutnya',exact=True).first.click();page.wait_for_timeout(100)
  expect(state(page,'s.runs.length')==1,'One automatic run at 10:00')
  dispatch(page,{'type':'tick','seconds':20});page.wait_for_timeout(100);expect('RUN-001' in page.locator('main').inner_text(),'Active run detail linked')
  page.screenshot(path=str(ROOT/'review/03-automation-active.png'),full_page=True)
  dispatch(page,{'type':'tick','seconds':400});dispatch(page,{'type':'next'});dispatch(page,{'type':'tick','seconds':200});page.wait_for_timeout(100)
  expect(state(page,"s.runs.filter(r=>r.status==='Completed'&&['RTN-001','RTN-002'].includes(r.routineId)).length")==2,'Irrigation and fertigation automatically completed')
 check(page,'Automatic irrigation and fertigation across demo clock',automatic)
 def builder():
  reset(page);nav(page,'/otomasi?tab=builder&routine=RTN-001');expect(page.locator('input').count()>0,'Builder has real fields')
  page.screenshot(path=str(ROOT/'review/04-routine-builder.png'),full_page=True)
 check(page,'Six-stage routine builder renders',builder)
 def scenarios():
  reset(page);page.get_by_role('button',name='Skenario & pengaturan demo').click();dialog=page.locator('dialog[open]')
  dialog.get_by_label('Skenario deterministik').select_option('low_tank');dialog.get_by_role('button',name='Kembali ke demo').click()
  dispatch(page,{'type':'next'});nav(page,'/otomasi?tab=executions');expect('Level tangki air' in page.locator('main').inner_text(),'Actionable low-tank failure')
 check(page,'Scenario selector drives real blocked state',scenarios)
 def planner_flow():
  reset(page);nav(page,'/biaya?period=2026-09');page.get_by_role('button',name='Rencana perangkat',exact=True).first.click()
  d=page.locator('dialog[open]');expect('Rp 2.860.000' in d.inner_text(),'Two-zone planning total')
  d.locator('input[type=checkbox]').check();expect('Rp 2.090.000' in d.inner_text(),'Owned controller not bought twice')
  d.locator('select').select_option('6');expect('Rp 4.290.000' in d.inner_text(),'Six-zone planning recalculates')
  d.get_by_role('button',name='Simpan rencana',exact=True).click();expect(state(page,'s.expenses.length')==7,'No actual expense from plan')
  expect(state(page,'s.devices.length')==25,'No installed device from plan');page.keyboard.press('Escape')
 check(page,'Planner changes scope and owned assets without creating expenses',planner_flow)
 def builder_activation():
  reset(page);nav(page,'/otomasi?tab=builder&routine=RTN-001');page.get_by_label('Nama rutinitas',exact=True).fill('Penyiraman A–B versi ditinjau')
  for _ in range(5):page.get_by_role('button',name='Lanjut',exact=True).click()
  page.locator('.review-check input').check();page.get_by_role('button',name='Simpan & aktifkan',exact=True).click();page.wait_for_timeout(150)
  expect(state(page,"s.routines.find(r=>r.id==='RTN-001').name")=='Penyiraman A–B versi ditinjau','Edited routine persisted')
  expect(state(page,"s.routines.find(r=>r.id==='RTN-001').status")=='Active','One-time review activated definition')
 check(page,'Routine builder saves reviewed version across all six stages',builder_activation)
 def table_filters():
  reset(page);nav(page,'/biaya?tab=expenses&period=2026-09');page.get_by_role('searchbox',name='Cari catatan, perangkat, atau ID…').fill('EXP-005');page.wait_for_timeout(150)
  expect(page.locator('main tbody tr').count()==1,'Search filters actual rows')
  expect('Rp 45.000' in page.locator('main tfoot').inner_text(),'Visible table footer matches filtered rows')
 check(page,'Expense table total respects local search filter',table_filters)
 def close_focus():
  reset(page);page.get_by_role('button',name='Skenario & pengaturan demo').click();expect(page.locator('dialog[open]').count()==1)
  page.keyboard.press('Escape');expect(page.locator('dialog[open]').count()==0)
 check(page,'Native dialog Escape closes and releases modal',close_focus)
 reset(page)
 for width in [390,768,1280,1440]:
  page.set_viewport_size({'width':width,'height':1000})
  for route in ['/ringkasan','/greenhouse','/otomasi?tab=builder','/otomasi?tab=routines','/perangkat','/biaya?tab=expenses']:
   nav(page,route);sizes=page.evaluate('({body:document.documentElement.scrollWidth,viewport:innerWidth})');record(f'No page overflow {width}px {route}',sizes['body']<=width+1,str(sizes))
 page.set_viewport_size({'width':1440,'height':1050});reset(page)
 shots=[('/ringkasan','01-overview-desktop.png'),('/greenhouse','02-greenhouse.png'),('/pengendalian','05-control.png'),('/perangkat?device=PUMP-01&period=2026-09&detailTab=cost','06-device-cost.png'),('/biaya?period=2026-09','07-cost-overview.png'),('/biaya?tab=expenses&period=2026-09&device=PUMP-01','08-linked-expenses.png')]
 for route,name in shots:
  nav(page,route);page.locator('.toast button').click() if page.locator('.toast button').count() else None;page.wait_for_timeout(250);page.screenshot(path=str(ROOT/'review'/name),full_page=True)
 page.get_by_role('button',name='Detail EXP-005',exact=True).click();page.wait_for_timeout(100);page.screenshot(path=str(ROOT/'review/09-expense-detail.png'),full_page=True);page.keyboard.press('Escape')
 page.set_viewport_size({'width':390,'height':844});nav(page,'/ringkasan');page.wait_for_timeout(300);page.screenshot(path=str(ROOT/'review/10-overview-mobile.png'),full_page=True)
 def mobile_menu():
  page.get_by_role('button',name='Buka menu',exact=True).click();page.locator('nav').get_by_role('link',name='Perangkat',exact=True).click();page.wait_for_timeout(100);expect(page.locator('main h1').inner_text()=='Perangkat');page.get_by_role('button',name='Detail PUMP-01',exact=True).click();expect(page.locator('dialog[open]').count()==1)
 check(page,'Mobile drawer navigation and device sheet',mobile_menu)
 record('No runtime page errors',not errors,'; '.join(errors))
 external=[r for r in requests if r.startswith('http')];record('No backend / external runtime requests',not external,str(external))
 # Actual storage-unavailable fallback is separately exercised without shim.
 fallback=browser.new_page(viewport={'width':390,'height':844});fallback.set_content(HTML,wait_until='load');fallback.wait_for_timeout(100);record('Storage-unavailable fallback stays usable','Penyimpanan browser tidak tersedia' in fallback.locator('body').inner_text())
 browser.close()
(ROOT/'docs/browser-test-results.json').write_text(json.dumps(RESULTS,indent=2,ensure_ascii=False))
print(json.dumps({'checks':len(RESULTS),'passed':sum(x['passed'] for x in RESULTS),'failed':[x for x in RESULTS if not x['passed']]},indent=2,ensure_ascii=False))
