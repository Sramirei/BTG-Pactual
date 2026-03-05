import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import Card from "../ui/Card";

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("es-CO");
};

const normalizeType = (type) => {
  if (type === "OPEN") {
    return "Apertura";
  }

  if (type === "TOPUP") {
    return "Recarga";
  }

  return "Cancelacion";
};

const HistorySection = ({ transactions, formatCurrency }) => (
  <section>
    <Card className="history-card">
      <div className="history-table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th>Transaccion</th>
              <th>Fondo</th>
              <th>Monto</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="history-empty">
                  Aun no hay transacciones registradas.
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => {
                const type = normalizeType(transaction.type);
                const fundName = transaction.fundName ?? transaction.fund;
                const date = transaction.createdAt ?? transaction.date;
                const key = transaction.transactionKey ?? transaction.id;

                return (
                  <tr key={key}>
                    <td>
                      <span className="history-type">
                        {type === "Apertura" ? (
                          <ArrowUpRight size={16} className="type-open" />
                        ) : type === "Recarga" ? (
                          <Wallet size={16} className="type-topup" />
                        ) : (
                          <ArrowDownLeft size={16} className="type-cancel" />
                        )}
                        {type}
                      </span>
                    </td>
                    <td>{fundName}</td>
                    <td>{formatCurrency(transaction.amount)}</td>
                    <td>{formatDateTime(date)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  </section>
);

export default HistorySection;
