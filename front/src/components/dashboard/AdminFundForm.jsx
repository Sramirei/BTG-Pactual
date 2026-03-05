import { useState } from "react";
import Button from "../ui/Button";
import Card from "../ui/Card";

const INITIAL_FORM = {
  fundId: "",
  name: "",
  minimumAmount: "",
  category: "FPV",
};

const AdminFundForm = ({ visible, onCreate, isLoading }) => {
  const [form, setForm] = useState(INITIAL_FORM);

  if (!visible) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const success = await onCreate({
      fundId: form.fundId.trim(),
      name: form.name.trim(),
      minimumAmount: Number.parseInt(form.minimumAmount, 10),
      category: form.category,
    });

    if (success) {
      setForm(INITIAL_FORM);
    }
  };

  return (
    <section>
      <h3 className="section-title">Crear fondo (solo ADMIN)</h3>
      <Card className="admin-fund-card">
        <form className="admin-fund-form" onSubmit={handleSubmit}>
          <input
            name="fundId"
            value={form.fundId}
            onChange={handleChange}
            placeholder="ID"
            required
          />
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nombre del fondo"
            required
          />
          <input
            type="number"
            min="1"
            name="minimumAmount"
            value={form.minimumAmount}
            onChange={handleChange}
            placeholder="Monto minimo"
            required
          />
          <select name="category" value={form.category} onChange={handleChange}>
            <option value="FPV">FPV</option>
            <option value="FIC">FIC</option>
          </select>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creando..." : "Crear Fondo"}
          </Button>
        </form>
      </Card>
    </section>
  );
};

export default AdminFundForm;
