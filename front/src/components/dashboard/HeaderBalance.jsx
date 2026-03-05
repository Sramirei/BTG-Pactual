import { Wallet } from "lucide-react";
import Card from "../ui/Card";

const HeaderBalance = ({ view, balance }) => (
  <header className="view-header">
    <div>
      <h2>{view === "dashboard" ? "Inversiones" : "Historial de Actividad"}</h2>
      <p>Gestiona tu capital eficientemente</p>
    </div>

    <Card className="balance-card">
      <div className="balance-icon">
        <Wallet size={18} />
      </div>
      <div>
        <small>Disponible</small>
        <strong>${Number(balance ?? 0).toLocaleString("es-CO")}</strong>
      </div>
    </Card>
  </header>
);

export default HeaderBalance;
