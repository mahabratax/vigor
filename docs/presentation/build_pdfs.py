"""Render the English Vigor review deck and presenter guide from source.

Run with the primary Python runtime. Output paths are arguments so generated
deliverables can be stored outside the source repository. Fonts and the logo
come from the application, not a remote service. No external market or impact
claims are made. Keep activation and submission status current before reuse.
"""
from pathlib import Path
import argparse
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.lib.utils import ImageReader
from fontTools.ttLib import TTFont as Font
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parents[2]
INK = '#20352B'
GREEN = '#1D593F'
LEAF = '#73A15C'
WATER = '#357E88'
DEW = '#F3F7F4'
MUTED = '#52665B'
LINE = '#D2DFD5'
AMBER = '#92571E'
WHITE = '#FFFFFF'
SITE = 'https://vigor-greenhouse-aldi.brawnycoin1.chatgpt.site'
DATE = '16 October 2026'

def setup_fonts(cache):
    source = ROOT / 'node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2'
    for weight, name in [(400, 'Jakarta'), (600, 'Jakarta-Semibold'), (700, 'Jakarta-Bold')]:
        dest = cache / f'jakarta-{weight}.ttf'
        f = instantiateVariableFont(Font(str(source)), {'wght': weight}, inplace=False)
        # Distinct internal face names prevent PDF font-cache deduplication of weights.
        for record in f['name'].names:
            if record.nameID == 6:
                record.string = f'PlusJakartaSans-{weight}'.encode(record.getEncoding())
        f.flavor = None
        f.save(str(dest))
        pdfmetrics.registerFont(TTFont(name, str(dest)))
    pdfmetrics.registerFontFamily('Jakarta', normal='Jakarta', bold='Jakarta-Bold')

class Page:
    def __init__(self, path, width, height, title):
        self.c = canvas.Canvas(str(path), pagesize=(width, height), pageCompression=1)
        self.w, self.h = width, height
        self.c.setTitle(title)
        self.c.setAuthor('Vigor')
        self.c.setSubject('AI Builder Cup review edition. Sustainability & Social Impact. Live Gemini and GCP activation pending.')
        self.n = 0
        self.regions = []
    def box(self, x, y, w, h, color, stroke=None):
        self.c.setFillColor(HexColor(color))
        if stroke:
            self.c.setStrokeColor(HexColor(stroke))
        self.c.rect(x, self.h-y-h, w, h, stroke=bool(stroke), fill=1)
    def line(self, x, y, x2, y2, color=LINE, width=1):
        self.c.setStrokeColor(HexColor(color)); self.c.setLineWidth(width)
        self.c.line(x, self.h-y, x2, self.h-y2)
    def text(self, text, x, y, w, size=24, color=INK, weight=400, leading=None):
        name = {400:'Jakarta',600:'Jakarta-Semibold',700:'Jakarta-Bold'}[weight]
        p = Paragraph(text, ParagraphStyle('t',fontName=name,fontSize=size,leading=leading or size*1.35,textColor=HexColor(color),spaceAfter=0))
        _, h = p.wrap(w, self.h)
        if y+h > self.h-20:
            raise ValueError(f'Page {self.n}: text outside safe bounds: {text[:60]}')
        p.drawOn(self.c,x,self.h-y-h)
        self.regions.append((self.n,x,y,w,h,text))
        return h
    def start(self, title=None, note=None, dark=False):
        if self.n: self.c.showPage()
        self.n += 1
        self.dark = dark
        self.box(0,0,self.w,self.h,GREEN if dark else DEW)
        if title: self.text(title,58,43,self.w-116,38 if self.w>1000 else 25,WHITE if dark else INK,600,47 if self.w>1000 else 33)
        if note: self.text(note,58,112,self.w-116,19,MUTED)
        f = '#D0E0D5' if dark else MUTED
        if self.w>1000:
            self.text('Vigor',58,self.h-43,200,13,f,600)
            self.text(str(self.n).zfill(2),self.w-85,self.h-43,35,13,f,600)
        else:
            self.text('Vigor / Presenter guide',42,self.h-38,380,9,f)
            self.text(str(self.n),self.w-55,self.h-38,20,9,f)
    def save(self): self.c.save()

def deck(out):
    d = Page(out,1280,720,'Vigor | AI Builder Cup proposal | Review edition')
    d.start()
    d.c.drawImage(ImageReader(str(ROOT/'public/assets/vigor-forest.webp')),58,720-64-123,388,123,preserveAspectRatio=True,mask='auto')
    d.text('Greenhouse decisions with<br/>a traceable next step',58,252,1055,55,INK,600,69)
    d.text('Care and resource use connected to harvest and business results.',62,420,1040,26,MUTED)
    d.box(0,539,1280,181,GREEN)
    d.text('Sustainability &amp; Social Impact',60,568,800,25,WHITE,600)
    d.text('GEN AI Academy APAC Edition / AI Builder Cup',60,610,900,18,'#D0E0D5')
    d.text('Review edition / October 2026',60,650,850,15,'#D0E0D5')

    d.start('A decision crosses several records', 'Product hypothesis for small greenhouse teams in Indonesia')
    d.text('“A crop needs attention.<br/>What should we do next?”',58,192,550,38,GREEN,600,51)
    d.text('A reading alone cannot explain who should act, what to check next or which harvest lot may be affected.',60,369,500,24,MUTED,400,34)
    for y,t,b in [(190,'Plant health','An observation needs context and a follow-up inspection.'),(320,'Daily work','A task needs an owner, an outcome and a source record.'),(450,'Business results','Harvest, costs and receipts need a consistent crop-cycle view.')]:
        d.line(688,y-15,1215,y-15)
        d.text(t,688,y,510,26,INK,600)
        d.text(b,688,y+46,510,23,MUTED)
    d.text('Pilot interviews will test this hypothesis. No market-size or field-impact claim is made here.',60,626,1120,16,MUTED)

    d.start('One workflow reaches the harvest')
    # Native process table: each row names an actual gate in the application.
    d.text('Stage',60,138,230,18,MUTED,600)
    d.text('Linked work',355,138,480,18,MUTED,600)
    d.text('Review gate',924,138,290,18,MUTED,600)
    rows=[('Evidence','Zone readings and an inspection case','Check quality and freshness.'),('Care','A follow-up task and recorded outcome','Check the source after the work.'),('Harvest','Grade stock and lot release','Resolve holds before sale.'),('Result','Sales, receipts and allocated costs','Review missing costs and baseline.')]
    for i,(a,b,c) in enumerate(rows):
        y=191+i*106
        d.line(60,y-15,1220,y-15)
        d.text(a,60,y,250,28,GREEN,600)
        d.text(b,355,y,500,23)
        d.text(c,924,y,288,21,MUTED)
    d.text('Each stage retains its own status. Task completion does not automatically prove crop recovery.',60,644,1120,17,MUTED)

    d.start('Gemini reasons over selected evidence')
    d.text('“What needs attention before this harvest can be sold?”',60,133,1140,30,GREEN,600)
    d.text('Gemini contribution',60,234,520,26,INK,600)
    d.text('Interprets the question and explains up to three existing findings.<br/><br/>Connects related records and states uncertainty or missing evidence.',60,291,515,24,INK,400,34)
    d.text('Application controls',688,234,525,26,INK,600)
    d.text('Checks source IDs, greenhouse scope and snapshot freshness.<br/><br/>Opens existing review forms. Model text cannot run a device or create a payment.',688,291,525,24,INK,400,34)
    d.line(60,560,1215,560)
    d.text('Current status: gateway and structured-response checks implemented. Live Gemini calls and evaluation await activation.',60,589,1135,21,AMBER)

    d.start('The operational prototype is working', 'The same records support the whole journey in the private review Site.')
    data=[('Greenhouse context','Zones, crop batches, assets and 2D/3D views','/greenhouse?tab=monitoring&view=2d'),('Action and follow-through','Assistant sources, care tasks and outcome review','/siklus?tab=care'),('Routine operations','Schedules, checks and browser simulation','/otomasi?tab=schedule'),('Harvest and commerce','Lot review, available stock, sales and receipts','/siklus?tab=harvest'),('Resources and finance','Device expenses, allocations and cycle results','/biaya?tab=profit')]
    for i,(a,b,path) in enumerate(data):
        y=177+i*82
        d.line(60,y-14,1215,y-14)
        d.text(a,60,y,350,24,GREEN,600)
        d.text(b,442,y,750,23)
        d.c.linkURL(SITE+'/#'+path,(60,720-y-45,1215,720-y+5),relative=0)
    d.text('Browser SQLite persists records on one device. Camera, sensor and payment connections are not live.',60,625,1125,18,MUTED)

    d.start('Google Cloud deployment path', 'Prepared architecture. Deployment and live model verification are pending.')
    # Editable PDF vectors are evidence architecture, not decorative artwork.
    nodes=[(60,212,335,144,'Browser','React app and local SQLite'),(473,212,335,144,'Cloud Run','Full app and AI gateway'),(886,212,335,144,'Gemini','Explanation with source IDs')]
    for x,y,w,h,t,b in nodes:
        d.box(x,y,w,h,WHITE,LINE)
        d.text(t,x+24,y+22,w-48,27,GREEN,600)
        d.text(b,x+24,y+72,w-48,21)
    for x in [395,808]:
        d.line(x,284,x+78,284,WATER,2)
        d.line(x+69,279,x+78,284,WATER,2);d.line(x+69,289,x+78,284,WATER,2)
    d.box(473,439,335,100,WHITE,LINE)
    d.text('Secret Manager',497,456,287,25,GREEN,600)
    d.text('Server-side credential',497,496,287,18,MUTED)
    d.line(640,439,640,356,WATER,2)
    d.text('Validated findings only<br/>Explicit question and scope',60,402,335,21,MUTED)
    d.text('The gateway rejects invalid or stale model references.',886,402,335,21,MUTED)
    d.text('Scaling step: authenticated tenancy and a shared database. Hardware ingestion and unattended scheduling follow separately.',60,605,1125,20,MUTED)

    d.start('Impact needs a comparable baseline')
    d.text('Measure',60,137,330,18,MUTED,600)
    d.text('Calculation',436,137,500,18,MUTED,600)
    d.text('Required evidence',948,137,270,18,MUTED,600)
    rows=[('Water intensity','Measured liters / reviewed harvest kg','Meter and harvest records'),('Energy intensity','Measured kWh / reviewed harvest kg','Energy and harvest records'),('Waste share','Discarded kg / total harvested kg','Graded output and losses'),('Inspection effort','Minutes per completed inspection','Observed time before and after')]
    for i,(a,b,c) in enumerate(rows):
        y=191+i*99
        d.line(60,y-15,1215,y-15)
        d.text(a,60,y,338,25,GREEN,600)
        d.text(b,436,y,470,22)
        d.text(c,948,y,270,20,MUTED)
    d.text('Compare crop, stage, area and period. Current values illustrate the workflow. Verified field savings are not yet available.',60,614,1130,20,AMBER)

    d.start('Affordability starts with a bounded setup')
    d.text('Start with one greenhouse',60,151,540,30,GREEN,600)
    d.text('Use existing devices where possible. Register costs against the equipment and crop cycle they support.',60,210,535,25,INK,400,36)
    d.text('Keep 2D available on phones. Add cameras, meters or solar only when the use case and measurements justify them.',60,366,535,25,INK,400,36)
    d.text('Monthly operating-cost model',688,151,535,27,INK,600)
    y=214
    for title,body in [('AI usage','Input tokens × input rate + output tokens × output rate'),('Hosting and data','Measured compute, storage and network use'),('Equipment','Maintenance, connectivity and allocated hardware cost')]:
        d.line(688,y-9,1215,y-9)
        d.text(title,688,y+5,515,23,GREEN,600)
        h=d.text(body,688,y+43,515,21,MUTED)
        y+=117
    d.text('Pricing and hardware quotes remain unverified. Solar savings require measured generation and consumption.',60,630,1140,18,MUTED)

    d.start('Validation before a grower pilot')
    d.text('Verified in development',60,152,550,28,GREEN,600)
    d.text('Production build checks for the Site and the Cloud Run package.<br/><br/>Automated checks cover data relationships, action guards, AI contracts and navigation.',60,215,530,24,INK,400,35)
    d.text('Still to verify',688,152,520,28,AMBER,600)
    d.text('Real Gemini responses across 10 evaluation cases.<br/><br/>Rendered layouts at 390, 768, 1280 and 1440 px, including WebGL and native dialog behavior.',688,215,520,24,INK,400,35)
    d.line(60,510,1215,510)
    d.text('Proposed pilot',60,544,270,25,GREEN,600)
    d.text('One greenhouse team across comparable crop periods. Review action usefulness, inspection time and resource use per kg.',362,544,840,23)
    d.text('DOM tests do not establish visual quality. Live AI effectiveness and field impact remain unmeasured.',60,644,1140,16,MUTED)

    d.start('What remains before submission')
    rows=[('English proposal PDF','Ready for team review'),('Private working prototype','Available on the review Site'),('Google model evidence','Pending activation and evaluation'),('Google Cloud deployment','Pending billing, deployment and smoke test'),('Public video, up to 3 minutes','Record the real GCP and Gemini flow after activation')]
    for i,(a,b) in enumerate(rows):
        y=150+i*74
        d.line(60,y-12,1215,y-12)
        d.text(a,60,y,490,23,INK,600)
        d.text(b,600,y,600,22,GREEN if i<2 else AMBER)
    d.text('Sustainability &amp; Social Impact',60,548,900,30,GREEN,600)
    d.text('Open private prototype',60,610,510,21,GREEN,600)
    d.c.linkURL(SITE,(60,720-641,500,720-606),relative=0)
    d.text('Owner access required. This review Site does not satisfy the GCP hosting requirement.',60,645,1120,16,MUTED)
    d.save()
    return d

def guide(out):
    g=Page(out,595.276,841.89,'Vigor | Presenter guide and submission checklist')
    def title(t,sub):
        g.start()
        g.text(t,42,45,510,27,INK,600,35)
        g.text(sub,42,126,510,11,MUTED,400,16)
    def section(t,body,y):
        g.text(t,42,y,510,14,GREEN,600)
        return g.text(body,42,y+25,510,11.5,INK,400,17)+y+45
    title('Presentation rehearsal<br/>and submission checklist','English review pack / '+DATE+' / Sustainability &amp; Social Impact')
    y=section('Current presentation boundary','The multi-page prototype works with saved browser records. Local records answers use deterministic lookup. Gemini and GCP activation await payment and configuration. Do not describe this rehearsal as a live AI or device demonstration.',172)
    y=section('Before the walkthrough','Use the same browser that contains your reviewed data. Open Settings / Storage and select Download backup before rehearsal. Check the selected greenhouse, crop cycle and role. Make sure the records you plan to show exist.',y+6)
    y=section('Presentation setup','Use 1280 or 1440 px for screen recording, 100% browser zoom and a quiet desktop. Keep the 2D greenhouse view selected for a reliable flow. Test 3D separately on the actual presentation device. Close personal tabs and notifications.',y+6)
    y=section('Open the guided path','Open the account menu at the bottom of the sidebar, select Vigor guide, then Start tour under 3-minute walkthrough. On mobile, open Menu first. Select Try on page to interact and Resume tour to continue. Timing labels are suggestions, not a running timer.',y+6)
    y=section('Rehearsal discipline','Follow one existing case, task and harvest lot where your records link them. If no linked example exists, explain the separate workflow stages instead of claiming a trace. The tour itself does not write business records. Any form you submit still saves real local changes.',y+6)
    g.text('Private prototype',42,758,500,11,GREEN,600)
    g.c.linkURL(SITE,(42,841.89-780,530,841.89-752),relative=0)

    title('Three-minute walkthrough','Use the current-status script below while Gemini remains disconnected. Rehearse once with a timer.')
    script=[
      ('0:00–0:15','Greenhouse / Monitoring','Vigor helps small greenhouse teams connect plant conditions with the work and business records that follow. This view shows our saved prototype data.'),
      ('0:15–0:50','Dashboard / Vigor assistant','I can ask what needs attention and open the supporting record. Today, Local records uses a bounded lookup. Gemini integration is prepared, but we have not activated it. The workflow already links a next action to its evidence.'),
      ('0:50–1:15','Pests & inspections / Detection review','Before acting, the grower checks the observation and its quality. Missing or expired evidence calls for another check. It cannot establish that a crop is healthy.'),
      ('1:15–1:35','Crop cycle / Care & pests','A task records who does the work and what happened. Finishing it leaves the source review separate, so the system does not assume that the problem has disappeared.'),
      ('1:35–2:00','Crop cycle / Harvest & stock','Harvest output has grades and a release status. An unresolved case can hold a lot. Sales use available stock, while payments remain separate from recorded sales.'),
      ('2:00–2:20','Costs & savings / Cycle profit','Cycle results use sales and reviewed cost allocations. We identify incomplete costs. We do not add savings to revenue, which would count the benefit twice.'),
      ('2:20–2:40','Costs & savings / Harvest efficiency','The pilot will compare water and energy per kilogram, waste and inspection time. The prototype shows how we calculate these measures. We do not claim measured field savings yet.'),
      ('2:40–3:00','Settings / AI integration','This page shows the actual model and hosting status. After activation, we will verify Gemini on Cloud Run and record the real flow for the final submission.'),
    ]
    y=170
    for timing,path,words in script:
        g.line(42,y-7,553,y-7)
        g.text(timing,42,y,91,10,GREEN,600)
        g.text(path,142,y,407,10.5,INK,600)
        h=g.text(words,142,y+20,407,10.3,INK,400,14.5)
        y+=max(66,h+36)

    title('Handoff and recovery','The final recording must demonstrate the real Google model on the deployed GCP application.')
    y=section('When payment and access are ready','Configure the enabled Gemini model and server-side secret. Deploy the prepared application to Cloud Run. Export the existing browser backup before changing origin, then restore it through the app. Verify the deployed routes, assets, worker and SQLite restore.',171)
    y=section('Evidence to collect','Run the 10 cases in docs/HACKATHON_READINESS.md with the real model. Keep exported analyses with model ID, timestamps, sources, usage and latency. Have a reviewer check unsupported claims, stale evidence and action links. Mocked tests do not replace these results.',y+5)
    y=section('Recording and proposal updates','Replace the Local records segment with a successful Gemini question, source review and linked action. Update the final narration only after GCP hosting is verified. Add the real GCP URL and public video URL to the proposal. Choose the publishing destination before uploading the video.',y+5)
    y=section('If something goes wrong','Missing records: confirm browser and greenhouse, then inspect your backup before restoring. A restore replaces the workspace. Unavailable 3D: switch to 2D. A missing tour target: use Try on page or continue. A Gemini error: show the error honestly and retry when available. Do not substitute a local answer and call it Gemini.',y+5)
    y=section('Final checks','Review rendered layouts at 390, 768, 1280 and 1440 px on actual browsers. Test keyboard navigation, touch controls, dialog focus and the 2D fallback. Verify the final video is public and at most three minutes. Confirm submission links open for the intended reviewers without changing access unintentionally.',y+5)
    g.text('Sources: owner-supplied event brief, current Vigor application and repository readiness documents. This pack contains no independently verified market estimates, model results or field-savings claims.',42,748,511,9,MUTED,400,13)
    g.save()
    return g

if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--output-dir',required=True)
    p.add_argument('--cache-dir',required=True)
    args=p.parse_args()
    out=Path(args.output_dir);out.mkdir(parents=True,exist_ok=True)
    cache=Path(args.cache_dir);cache.mkdir(parents=True,exist_ok=True)
    setup_fonts(cache)
    a=deck(out/'Vigor-Hackathon-Proposal.pdf')
    b=guide(out/'Vigor-Presenter-Guide.pdf')
    print(f'Created {a.n} proposal slides and {b.n} presenter pages.')
