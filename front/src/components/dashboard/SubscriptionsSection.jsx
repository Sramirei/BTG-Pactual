import Button from "../ui/Button";
import Card from "../ui/Card";

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("es-CO");
};

const SubscriptionsSection = ({ subscriptions, onCancel, formatCurrency, cancelingFundId }) => (
  <section>
    <div className="section-header">
      <h3>Tus Suscripciones</h3>
      <span>{subscriptions.length} Activas</span>
    </div>

    {subscriptions.length === 0 ? (
      <div className="empty-state">No tienes fondos activos en este momento.</div>
    ) : (
      <div className="subscription-grid">
        {subscriptions.map((sub) => {
          const displayName = sub.fundName ?? sub.name;
          const fundId = String(sub.fundId ?? sub.id ?? "");

          return (
            <Card key={`${fundId}-${sub.subscriptionId ?? sub.openedAt ?? sub.id}`} className="sub-card">
              <div>
                <div className="sub-card-top">
                  <h4>{displayName}</h4>
                  <span className="status-pill">Activo</span>
                </div>
                <p className="sub-amount">{formatCurrency(sub.amount)}</p>
                <p className="sub-date">Invertido el {formatDate(sub.openedAt ?? sub.date)}</p>
              </div>
              <Button
                variant="danger"
                className="w-full"
                disabled={cancelingFundId === fundId}
                onClick={() => onCancel(sub)}
              >
                {cancelingFundId === fundId ? "Cancelando..." : "Cancelar Suscripcion"}
              </Button>
            </Card>
          );
        })}
      </div>
    )}
  </section>
);

export default SubscriptionsSection;
