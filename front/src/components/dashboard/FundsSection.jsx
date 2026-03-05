import Button from "../ui/Button";
import Card from "../ui/Card";

const FundsSection = ({ funds, onSubscribe, formatCurrency }) => (
  <section>
    <h3 className="section-title">Explorar Fondos</h3>

    {funds.length === 0 ? (
      <div className="empty-state">No hay fondos disponibles para suscribirse.</div>
    ) : (
      <div className="fund-grid">
        {funds.map((fund) => {
          const fundId = fund.fundId ?? fund.id;
          const minimumAmount = fund.minimumAmount ?? fund.minAmount ?? 0;

          return (
            <Card key={fundId} className="fund-card">
              <div className="fund-card-body">
                <p className="fund-category">{fund.category}</p>
                <h4>{fund.name}</h4>
                <p className="fund-minimum">
                  Minimo: <strong>{formatCurrency(minimumAmount)}</strong>
                </p>
              </div>

              <Button variant="secondary" onClick={() => onSubscribe(fund)}>
                Suscribirse
              </Button>
            </Card>
          );
        })}
      </div>
    )}
  </section>
);

export default FundsSection;
