import { displayLabel } from '../i18n/display';
import {
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Moon,
  Monitor,
  UserRound,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bug,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Coins,
  Cpu,
  Download,
  Droplets,
  ExternalLink,
  Eye,
  FileText,
  FlaskConical,
  HelpCircle,
  History,
  House,
  Info,
  Layers,
  LayoutGrid,
  Leaf,
  Link as LinkIcon,
  MapPin,
  Maximize2,
  Menu,
  MoreHorizontal,
  Package,
  Pause,
  Pencil,
  Play,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sprout,
  Square,
  Sun,
  Thermometer,
  Trash2,
  TriangleAlert,
  Undo2,
  Users,
  Wallet,
  Wifi,
  Wind,
  Workflow,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import React from 'react';
import { usePermission } from '../features/access/AccessContext';
import type { Permission } from '../features/access/permissions';
import type { ActionResult } from '../domain/actions';
import { FarmIllustration } from './FarmIllustration';
import type { IllustrationName } from '../data/illustrations';
const icons = {
  bell: Bell,
  collapse: PanelLeftClose,
  expand: PanelLeftOpen,
  logout: LogOut,
  moon: Moon,
  monitor: Monitor,
  user: UserRound,
  home: House,
  greenhouse: Sprout,
  bug: Bug,
  leaf: Leaf,
  workflow: Workflow,
  devices: Cpu,
  history: History,
  wallet: Wallet,
  plus: Plus,
  chevron: ChevronRight,
  down: ChevronDown,
  up: ArrowUpRight,
  lower: ArrowDownRight,
  arrow: ArrowRight,
  back: ArrowLeft,
  check: Check,
  alert: TriangleAlert,
  clock: Clock,
  calendar: CalendarDays,
  play: Play,
  pause: Pause,
  stop: Square,
  search: Search,
  close: X,
  settings: Settings2,
  drop: Droplets,
  temp: Thermometer,
  wind: Wind,
  flask: FlaskConical,
  bolt: Zap,
  wifi: Wifi,
  wrench: Wrench,
  camera: Camera,
  layers: Layers,
  fullscreen: Maximize2,
  print: Printer,
  download: Download,
  file: FileText,
  filter: SlidersHorizontal,
  more: MoreHorizontal,
  link: LinkIcon,
  refresh: RotateCcw,
  shield: ShieldCheck,
  users: Users,
  info: Info,
  menu: Menu,
  grid: LayoutGrid,
  sun: Sun,
  map: MapPin,
  external: ExternalLink,
  trash: Trash2,
  edit: Pencil,
  undo: Undo2,
  box: Package,
  help: HelpCircle,
  checkcircle: CheckCircle2,
  eye: Eye,
  coins: Coins,
};
export type IconName = keyof typeof icons;
export function Icon({
  name,
  size = 18,
  className = '',
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const C = icons[name] ?? House;
  return <C size={size} strokeWidth={1.7} aria-hidden="true" className={className} />;
}
export function Button({
  children,
  onClick,
  icon,
  tone = 'default',
  small = false,
  disabled = false,
  title,
  type = 'button',
  className = '',
  ariaLabel,
  permission,
}: {
  children?: React.ReactNode;
  onClick?: () => void;
  icon?: IconName;
  tone?: 'default' | 'primary' | 'danger' | 'ghost';
  small?: boolean;
  disabled?: boolean;
  title?: string;
  type?: 'button' | 'submit';
  className?: string;
  ariaLabel?: string;
  permission?: Permission;
}) {
  const allowed = usePermission(permission);
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || !allowed}
      title={title ?? (!allowed ? 'Your role cannot perform this action.' : undefined)}
      aria-label={ariaLabel}
      className={`button ${tone} ${small ? 'small' : ''} ${className}`}
    >
      {icon && <Icon name={icon} size={small ? 15 : 17} />} {displayLabel(children)}
    </button>
  );
}
export function Badge({
  children,
  tone = 'gray',
  dot = false,
}: {
  children: React.ReactNode;
  tone?: string;
  dot?: boolean;
}) {
  return (
    <span className={`badge ${tone}`}>
      {dot && <span className="status-dot" />}
      {displayLabel(children)}
    </span>
  );
}
export function Card({
  children,
  title,
  subtitle,
  tools,
  className = '',
  id,
  variant = 'panel',
  'data-tour': tourTarget,
}: {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: IconName;
  tools?: React.ReactNode;
  className?: string;
  id?: string;
  variant?: 'panel' | 'register' | 'plain';
  'data-tour'?: string;
}) {
  return (
    <section id={id} className={`card card-${variant} ${className}`} data-tour={tourTarget}>
      {displayLabel(
        title && (
          <div className="card-head">
            <div className="card-heading">
              <div>
                <h2>{title}</h2>
                {subtitle && <p>{subtitle}</p>}
              </div>
            </div>
            {tools && <div className="card-tools">{tools}</div>}
          </div>
        ),
      )}
      <div className="card-body">{displayLabel(children)}</div>
    </section>
  );
}
export function Stats({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="stats"
      style={
        { '--metric-count': Math.min(4, React.Children.count(children)) } as React.CSSProperties
      }
    >
      {displayLabel(children)}
    </div>
  );
}
export function Stat({
  label,
  value,
  sub,
  tone = 'green',
  onClick,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon: IconName;
  tone?: string;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <span className="stat-text">
        <span className="stat-label">{displayLabel(label)}</span>
        <strong>{displayLabel(value)}</strong>
        <span className="stat-sub">{displayLabel(sub)}</span>
      </span>
      {onClick && <Icon name="chevron" size={17} className="stat-chevron" />}
    </>
  );
  return onClick ? (
    <button className="stat" data-tone={tone} onClick={onClick}>
      {inner}
    </button>
  ) : (
    <div className="stat" data-tone={tone}>
      {inner}
    </div>
  );
}
export function Alert({
  children,
  tone = 'amber',
  title,
  action,
}: {
  children?: React.ReactNode;
  tone?: 'amber' | 'green' | 'blue' | 'red' | 'gray';
  title?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={`notice ${tone}`}>
      <Icon
        name={
          tone === 'green' ? 'checkcircle' : tone === 'blue' || tone === 'gray' ? 'info' : 'alert'
        }
        size={18}
      />
      <div>
        {displayLabel(title && <strong>{title}</strong>)}
        {displayLabel(children && <div>{children}</div>)}
      </div>
      {displayLabel(action && <div className="notice-action">{action}</div>)}
    </div>
  );
}
export function Tabs({
  items,
  value,
  onChange,
  label = 'Page sections',
}: {
  items: {
    id: string;
    label: string;
    count?: number;
  }[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
}) {
  return (
    <>
      {items.length >= 4 && (
        <label className="mobile-section-picker">
          <span>{displayLabel(label)}</span>
          <select
            aria-label={`${label}, select a section`}
            value={value}
            onChange={(e) => onChange(e.currentTarget.value)}
          >
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {displayLabel(item.label)}
                {displayLabel(item.count !== undefined ? ` (${item.count})` : '')}
              </option>
            ))}
          </select>
        </label>
      )}
      <div
        className={`tabs ${items.length >= 4 ? 'tabs-adaptive' : ''}`}
        role="tablist"
        aria-label={label}
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            tabIndex={value === item.id ? 0 : -1}
            onKeyDown={(e) => {
              const key = e.key;
              if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return;
              e.preventDefault();
              const next =
                key === 'Home'
                  ? 0
                  : key === 'End'
                    ? items.length - 1
                    : (index + (key === 'ArrowRight' ? 1 : -1) + items.length) % items.length;
              onChange(items[next].id);
              (e.currentTarget.parentElement?.children[next] as HTMLElement)?.focus();
            }}
            aria-selected={value === item.id}
            className={value === item.id ? 'active' : ''}
            onClick={() => onChange(item.id)}
          >
            {displayLabel(item.label)}
            {item.count !== undefined && <span>{item.count}</span>}
          </button>
        ))}
      </div>
    </>
  );
}
export function Progress({ value, label }: { value: number; label?: string }) {
  return (
    <div className="progress-wrap">
      <div
        className="progress"
        role="progressbar"
        aria-label={label ?? 'Progress'}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
      >
        <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
      {displayLabel(label && <span>{label}</span>)}
    </div>
  );
}
export function Empty({
  title,
  detail,
  action,
  icon = 'leaf',
  illustration,
}: {
  title: string;
  detail?: string;
  action?: React.ReactNode;
  icon?: IconName;
  illustration?: IllustrationName;
}) {
  return (
    <div className="empty">
      {illustration ? (
        <FarmIllustration name={illustration} />
      ) : (
        <span className="empty-icon">
          <Icon name={icon} size={26} />
        </span>
      )}
      <h3>{displayLabel(title)}</h3>
      {displayLabel(detail && <p>{detail}</p>)}
      {displayLabel(action)}
    </div>
  );
}
export function Field({
  label,
  children,
  hint,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  const hintId = `${React.useId()}-hint`;
  return (
    <label className={`field ${className}`}>
      <span>{displayLabel(label)}</span>
      {React.Children.map(children, (child) => {
        if (
          !hint ||
          !React.isValidElement<React.HTMLAttributes<HTMLElement>>(child) ||
          !['input', 'select', 'textarea'].includes(String(child.type))
        )
          return child;
        return React.cloneElement(child, {
          'aria-describedby': [child.props['aria-describedby'], hintId].filter(Boolean).join(' '),
        });
      })}
      {displayLabel(hint && <small id={hintId}>{hint}</small>)}
    </label>
  );
}
export function Select({
  value,
  onChange,
  options,
  label,
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
  label: string;
  className?: string;
}) {
  return (
    <label className={`select-wrap ${className}`}>
      <span className="sr-only">{displayLabel(label)}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.currentTarget.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {displayLabel(o.label)}
          </option>
        ))}
      </select>
      <Icon name="down" size={14} />
    </label>
  );
}
export function SearchField({
  value,
  onChange,
  placeholder = 'Search records…',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="search-field">
      <Icon name="search" size={16} />
      <input
        type="search"
        value={value}
        aria-label={placeholder}
        placeholder={placeholder}
        onInput={(e: React.FormEvent<HTMLInputElement>) => onChange(e.currentTarget.value)}
      />
    </label>
  );
}
export function Meta({
  items,
}: {
  items: {
    label: string;
    value: React.ReactNode;
  }[];
}) {
  return (
    <dl className="meta-list">
      {items.map((i) => (
        <div key={i.label}>
          <dt>{displayLabel(i.label)}</dt>
          <dd>{displayLabel(i.value)}</dd>
        </div>
      ))}
    </dl>
  );
}
export function FormError({
  message,
  focusRef,
}: {
  message: string;
  focusRef?: React.Ref<HTMLDivElement>;
}) {
  return message ? (
    <div className="form-error" role="alert" tabIndex={-1} ref={focusRef}>
      <Icon name="alert" size={17} />
      {displayLabel(message)}
    </div>
  ) : null;
}
export class FormBox extends React.Component<
  {
    children: React.ReactNode;
    onSubmit: (f: FormData) => ActionResult | Promise<ActionResult>;
    className?: string;
  },
  {
    error: string;
    submitted: boolean;
  }
> {
  state = { error: '', submitted: false };
  private inFlight = false;
  private errorSummary = React.createRef<HTMLDivElement>();
  render() {
    return (
      <form
        className={this.props.className ?? 'form-stack'}
        onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          if (this.state.submitted || this.inFlight) return;
          this.inFlight = true;
          const form = e.currentTarget;
          form.setAttribute('aria-busy', 'true');
          const buttons = [...form.querySelectorAll<HTMLButtonElement>('button[type=submit]')];
          buttons.forEach((b) => (b.disabled = true));
          let result: ActionResult;
          try {
            result = await this.props.onSubmit(new FormData(form));
          } catch (e) {
            result = {
              ok: false,
              message: e instanceof Error ? e.message : 'Changes not saved.',
            };
          } finally {
            this.inFlight = false;
            form.removeAttribute('aria-busy');
            buttons.forEach((b) => (b.disabled = false));
          }
          this.setState({ error: result.ok ? '' : result.message, submitted: result.ok }, () => {
            if (!result.ok) this.errorSummary.current?.focus();
          });
        }}
      >
        <FormError message={this.state.error} focusRef={this.errorSummary} />
        {displayLabel(this.props.children)}
      </form>
    );
  }
}
export function Modal({
  title,
  description,
  children,
  onClose,
  wide = false,
  drawer = false,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
  drawer?: boolean;
}) {
  const dialog = React.useRef<HTMLDialogElement>(null);
  const id = React.useId();
  React.useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement as HTMLElement | null;
    element?.showModal();
    return () => {
      element?.close();
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className={`modal ${wide ? 'wide' : ''} ${drawer ? 'drawer' : ''}`}
      onCancel={(e: React.SyntheticEvent<HTMLDialogElement>) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e: React.MouseEvent<HTMLDialogElement>) => {
        if (e.target === dialog.current) onClose();
      }}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
    >
      <div className="modal-inner">
        <header className="modal-head">
          <div>
            <h2 id={`${id}-title`}>{displayLabel(title)}</h2>
            {displayLabel(description && <p id={`${id}-description`}>{description}</p>)}
          </div>
          <Button icon="close" tone="ghost" ariaLabel="Close" onClick={onClose} />
        </header>
        <div className="modal-body">{displayLabel(children)}</div>
      </div>
    </dialog>
  );
}
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="section-label">{displayLabel(children)}</div>;
}
export function SourceTag({ children = 'Tercatat' }: { children?: React.ReactNode }) {
  return <span className="source-tag">{displayLabel(children)}</span>;
}
