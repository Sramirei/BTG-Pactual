import { ShieldCheck } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";

const RegisterView = ({
  registerForm,
  onChange,
  onSubmit,
  onGoLogin,
  isLoading = false,
}) => (
  <div className="auth-page">
    <Card className="auth-card">
      <div className="auth-header">
        <div className="auth-logo">
          <ShieldCheck size={28} />
        </div>
        <h1>Crear cuenta</h1>
        <p>Registrate para comenzar a invertir</p>
      </div>

      <form onSubmit={onSubmit} className="auth-form">
        <label htmlFor="register-name">Nombre</label>
        <input
          id="register-name"
          name="name"
          type="text"
          required
          value={registerForm.name}
          onChange={onChange}
          placeholder="Tu nombre"
        />

        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          name="email"
          type="email"
          required
          value={registerForm.email}
          onChange={onChange}
          placeholder="ejemplo@correo.com"
        />

        <label htmlFor="register-password">Contrasena</label>
        <input
          id="register-password"
          name="password"
          type="password"
          required
          minLength={8}
          value={registerForm.password}
          onChange={onChange}
          placeholder="Minimo 8 caracteres"
        />

        <label htmlFor="register-notificationPreference">Preferencia de notificacion</label>
        <select
          id="register-notificationPreference"
          name="notificationPreference"
          value={registerForm.notificationPreference}
          onChange={onChange}
        >
          <option value="SMS">SMS</option>
          <option value="EMAIL">EMAIL</option>
        </select>

        {registerForm.notificationPreference === "SMS" ? (
          <>
            <label htmlFor="register-phone">Telefono celular</label>
            <input
              id="register-phone"
              name="phone"
              type="text"
              value={registerForm.phone}
              onChange={onChange}
              placeholder="+573001112233"
              required
            />
            <p className="auth-help">Se completa con +57 por defecto si no lo escribes.</p>
          </>
        ) : (
          <p className="auth-help">
            Las notificaciones se enviaran al correo registrado ({registerForm.email || "tu email"}).
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Registrando..." : "Registrarse"}
        </Button>
      </form>

      <button className="auth-switch" type="button" onClick={onGoLogin}>
        Ya tienes cuenta? Inicia sesion
      </button>
    </Card>
  </div>
);

export default RegisterView;
