import { useState } from "react";
import Button from "../ui/Button";
import Card from "../ui/Card";

const TopUpSection = ({ onTopUp, isLoading }) => {
  const [amount, setAmount] = useState("50000");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const numericAmount = Number.parseInt(amount, 10);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return;
    }

    const success = await onTopUp(numericAmount);
    if (success) {
      setAmount("50000");
    }
  };

  return (
    <section>
      <h3 className="section-title">Recargar saldo</h3>
      <Card className="topup-card">
        <form className="topup-form" onSubmit={handleSubmit}>
          <label htmlFor="topup-amount">Monto a recargar</label>
          <input
            id="topup-amount"
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Recargando..." : "Recargar"}
          </Button>
        </form>
      </Card>
    </section>
  );
};

export default TopUpSection;
