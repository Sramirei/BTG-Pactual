import Button from "../ui/Button";
import Card from "../ui/Card";

const SubscriptionModal = ({
  modal,
  onAmountChange,
  onConfirm,
  onClose,
  formatCurrency,
  isLoading,
  currentBalance = 0,
}) => {
  if (!modal.isOpen || !modal.fund) {
    return null;
  }

  const minimumAmount = modal.fund.minimumAmount ?? modal.fund.minAmount ?? 0;
  const fundName = modal.fund.name;
  const hasInsufficientBalance = Number(currentBalance) < Number(modal.amount || 0);

  return (
    <div className="modal-backdrop">
      <Card className="modal-card">
        <div className="modal-header">
          <h3>Confirmar Inversion</h3>
          <p>Deseas suscribirte a este fondo?</p>
        </div>

        <div className="modal-summary">
          <div>
            <span>Fondo seleccionado</span>
            <strong>{fundName}</strong>
          </div>
          <div>
            <span>Monto minimo</span>
            <strong>{formatCurrency(minimumAmount)}</strong>
          </div>
        </div>

        <label htmlFor="subscription-amount">Monto a invertir</label>
        <input
          id="subscription-amount"
          type="number"
          min={minimumAmount || 1}
          value={modal.amount}
          onChange={(event) => onAmountChange(event.target.value)}
          className="modal-amount-input"
        />

        <p className={`modal-balance-note ${hasInsufficientBalance ? "is-error" : ""}`}>
          Saldo disponible: {formatCurrency(currentBalance)}
          {hasInsufficientBalance ? " (saldo insuficiente para este monto)" : ""}
        </p>

        <div className="modal-actions">
          <Button onClick={onConfirm} disabled={isLoading || hasInsufficientBalance}>
            {isLoading ? "Procesando..." : "Confirmar Suscripcion"}
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SubscriptionModal;
