import {
  BarChart3,
  Box,
  CircleHelp,
  CreditCard,
  FileText,
  FlaskConical,
  Gauge,
  Gem,
  Layers3,
  Link2,
  Settings,
  Users,
} from "lucide-react";

const primaryNavigation = [
  { label: "Overview", icon: Gauge },
  { label: "Charts", icon: BarChart3, active: true },
  { label: "Customers", icon: Users },
  { label: "Paywalls", icon: Layers3 },
  { label: "Offerings", icon: Gem },
  { label: "Products", icon: Box },
  { label: "Experiments", icon: FlaskConical },
  { label: "Entitlements", icon: CreditCard },
  { label: "Integrations", icon: Link2 },
  { label: "Project settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">RevenueCat</div>

      <button className="project-switcher" type="button" aria-label="Switch project">
        <span className="app-icon"><span className="sound-bars">▥</span></span>
        <span className="project-copy"><strong>PeakMind</strong><small>iOS · com.peakmind.app</small></span>
        <span className="chevron">⌄</span>
      </button>

      <nav className="nav-list" aria-label="Main navigation">
        {primaryNavigation.map(({ label, icon: Icon, active }) => (
          <button className={`nav-item ${active ? "active" : ""}`} type="button" key={label}>
            <Icon size={17} strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-spacer" />

      <div className="utility-nav">
        <button className="nav-item" type="button"><FileText size={17} />Docs</button>
        <button className="nav-item" type="button"><CircleHelp size={17} />Help</button>
        <button className="profile-row" type="button"><span className="avatar">JD</span><span>John Doe</span><span className="chevron">›</span></button>
      </div>
    </aside>
  );
}
