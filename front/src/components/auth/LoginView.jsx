import { ShieldCheck } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";

const LoginView = ({
  loginForm,
  onChange,
  onSubmit,
  onGoRegister,
  isLoading = false,
}) => (
  <div className="auth-page">
    <Card className="auth-card">
      <div className="auth-header">
        <div className="auth-logo">
          <ShieldCheck size={28} />
        </div>
        <h1>Bienvenido</h1>
        <p>Gestiona tus fondos de inversion de forma sencilla</p>
      </div>

      <form onSubmit={onSubmit} className="auth-form">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          value={loginForm.email}
          onChange={onChange}
          placeholder="ejemplo@correo.com"
        />

        <label htmlFor="login-password">Contrasena</label>
        <input
          id="login-password"
          name="password"
          type="password"
          required
          value={loginForm.password}
          onChange={onChange}
          placeholder="********"
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Ingresando..." : "Iniciar Sesion"}
        </Button>
      </form>

      <button className="auth-switch" type="button" onClick={onGoRegister}>
        No tienes cuenta? Registrate
      </button>
    </Card>
  </div>
);

export default LoginView;
