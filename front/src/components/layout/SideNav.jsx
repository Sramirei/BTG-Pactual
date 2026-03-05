import { History, LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";

const SideNav = ({ view, onChangeView, onLogout }) => (
  <nav className="side-nav">
    <div className="side-nav-brand">
      <ShieldCheck size={22} />
      <span>Finova</span>
    </div>

    <button
      onClick={() => onChangeView("dashboard")}
      className={`side-nav-link ${view === "dashboard" ? "is-active" : ""}`}
      type="button"
    >
      <LayoutDashboard size={18} />
      <span>Escritorio</span>
    </button>

    <button
      onClick={() => onChangeView("history")}
      className={`side-nav-link ${view === "history" ? "is-active" : ""}`}
      type="button"
    >
      <History size={18} />
      <span>Historial</span>
    </button>

    <button onClick={onLogout} className="side-nav-link logout-link" type="button">
      <LogOut size={18} />
      <span>Cerrar sesion</span>
    </button>
  </nav>
);

export default SideNav;
