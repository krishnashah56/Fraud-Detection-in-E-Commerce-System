import { LayoutDashboard, Settings, ShieldAlert, Users } from "lucide-react";

const items = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Fraud Logs", icon: ShieldAlert },
  { label: "Users", icon: Users },
  { label: "Settings", icon: Settings }
];

const Sidebar = ({ activeItem, onSelect }) => {
  return (
    <aside className="glass-panel rounded-[28px] border border-white/70 p-6 shadow-panel lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          Risk Command
        </p>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink">
          Fraud Detection in E-Commerce System
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Real-time transaction triage for payments, anomalies, and admin decisions.
        </p>
      </div>

      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeItem === item.label;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onSelect(item.label)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                active
                  ? "bg-ink text-white shadow-lg shadow-slate-300/70"
                  : "bg-white/60 text-slate-600 hover:bg-white"
              }`}
            >
              <Icon size={18} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-8 rounded-3xl bg-gradient-to-br from-ink to-slate-800 p-5 text-white">
        <p className="text-sm uppercase tracking-[0.25em] text-white/60">Live Policy</p>
        <p className="mt-4 text-3xl font-bold">85+</p>
        <p className="mt-2 text-sm text-white/80">Auto-block threshold enforced by the backend.</p>
      </div>

    </aside>
  );
};

export default Sidebar;
