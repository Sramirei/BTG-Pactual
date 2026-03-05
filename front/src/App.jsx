import { useEffect, useMemo, useState } from "react";
import { ApiError, api } from "./api";
import LoginView from "./components/auth/LoginView";
import RegisterView from "./components/auth/RegisterView";
import AdminFundForm from "./components/dashboard/AdminFundForm";
import FundsSection from "./components/dashboard/FundsSection";
import HeaderBalance from "./components/dashboard/HeaderBalance";
import SubscriptionsSection from "./components/dashboard/SubscriptionsSection";
import TopUpSection from "./components/dashboard/TopUpSection";
import HistorySection from "./components/history/HistorySection";
import SideNav from "./components/layout/SideNav";
import SubscriptionModal from "./components/modals/SubscriptionModal";
import NotificationToast from "./components/ui/NotificationToast";
import { AVAILABLE_FUNDS } from "./constants/funds";
import "./App.css";

const TOKEN_STORAGE_KEY = "btg_front_token";

const formatCurrency = (value) => `$${Number(value ?? 0).toLocaleString("es-CO")}`;

const getErrorMessage = (error, fallback) => {
  if (error instanceof ApiError) {
    return error.message;
  }

  return fallback;
};

function App() {
  const [view, setView] = useState("login");
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) ?? "");

  const [user, setUser] = useState(null);
  const [funds, setFunds] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [modal, setModal] = useState({ isOpen: false, fund: null, amount: 0 });
  const [alert, setAlert] = useState(null);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "+57",
    notificationPreference: "SMS",
  });

  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isSubscribeLoading, setIsSubscribeLoading] = useState(false);
  const [cancelingFundId, setCancelingFundId] = useState("");
  const [isCreateFundLoading, setIsCreateFundLoading] = useState(false);
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);

  const fundsForDisplay = useMemo(() => {
    if (funds.length > 0) {
      return funds;
    }

    return AVAILABLE_FUNDS.map((fund) => ({
      fundId: String(fund.id),
      name: fund.name,
      category: fund.category,
      minimumAmount: fund.minAmount,
    }));
  }, [funds]);

  const availableFundsForSubscription = useMemo(() => {
    const activeFundIds = new Set(subscriptions.map((item) => String(item.fundId ?? item.id)));
    return fundsForDisplay.filter((fund) => !activeFundIds.has(String(fund.fundId ?? fund.id)));
  }, [fundsForDisplay, subscriptions]);

  const showNotification = (msg, type = "success") => {
    setAlert({ msg, type });
  };

  useEffect(() => {
    if (!alert) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setAlert(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [alert]);

  const resetSessionData = () => {
    setUser(null);
    setFunds([]);
    setSubscriptions([]);
    setTransactions([]);
    setModal({ isOpen: false, fund: null, amount: 0 });
  };

  const saveToken = (nextToken) => {
    if (nextToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    setToken(nextToken);
  };

  const logout = (showMessage = true) => {
    saveToken("");
    resetSessionData();
    setView("login");
    if (showMessage) {
      showNotification("Sesion cerrada.");
    }
  };

  const hydrateDashboard = async (activeToken) => {
    setIsDataLoading(true);

    try {
      const [profile, fundsData, subscriptionsData, transactionsData] = await Promise.all([
        api.getProfile(activeToken),
        api.listFunds(activeToken),
        api.listSubscriptions(activeToken),
        api.listTransactions(activeToken, { limit: 20 }),
      ]);

      setUser(profile);
      setFunds(fundsData.items ?? []);
      setSubscriptions(subscriptionsData.items ?? []);
      setTransactions(transactionsData.items ?? []);

      if (view === "login" || view === "register") {
        setView("dashboard");
      }
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        logout(false);
        showNotification("Token invalido o expirado. Inicia sesion nuevamente.", "error");
        return;
      }

      showNotification(getErrorMessage(error, "No fue posible cargar el dashboard."), "error");
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    void hydrateDashboard(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (token) {
      setView("dashboard");
    }
  }, [token]);

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    if (name === "notificationPreference") {
      setRegisterForm((previous) => ({
        ...previous,
        notificationPreference: value,
        phone: value === "SMS" ? previous.phone || "+57" : "",
      }));
      return;
    }

    if (name === "phone") {
      setRegisterForm((previous) => {
        if (previous.notificationPreference !== "SMS") {
          return previous;
        }

        return { ...previous, phone: value };
      });
      return;
    }

    setRegisterForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setIsAuthLoading(true);

    try {
      const data = await api.register(registerForm);
      saveToken(data.token);
      setUser(data.user);
      setView("dashboard");
      showNotification("Registro exitoso. Bienvenido.");

      setRegisterForm({
        name: "",
        email: "",
        password: "",
        phone: "+57",
        notificationPreference: "SMS",
      });

      await hydrateDashboard(data.token);
    } catch (error) {
      showNotification(getErrorMessage(error, "No fue posible registrar el usuario."), "error");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setIsAuthLoading(true);

    try {
      const data = await api.login(loginForm);
      saveToken(data.token);
      setUser(data.user);
      setView("dashboard");
      showNotification("Sesion iniciada.");

      setLoginForm({
        email: "",
        password: "",
      });

      await hydrateDashboard(data.token);
    } catch (error) {
      showNotification(getErrorMessage(error, "No fue posible iniciar sesion."), "error");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const openSubscriptionModal = (fund) => {
    setModal({
      isOpen: true,
      fund,
      amount: Number(fund.minimumAmount ?? fund.minAmount ?? 0),
    });
  };

  const closeSubscriptionModal = () => {
    if (isSubscribeLoading) {
      return;
    }

    setModal({ isOpen: false, fund: null, amount: 0 });
  };

  const handleSubscriptionAmountChange = (value) => {
    const parsed = Number.parseInt(value, 10);
    setModal((previous) => ({
      ...previous,
      amount: Number.isFinite(parsed) ? parsed : 0,
    }));
  };

  const confirmSubscription = async () => {
    if (!token) {
      showNotification("Debes iniciar sesion para suscribirte.", "error");
      return;
    }

    if (!modal.fund) {
      showNotification("Selecciona un fondo valido.", "error");
      return;
    }

    const amount = Number.parseInt(String(modal.amount), 10);
    if (!Number.isFinite(amount) || amount <= 0) {
      showNotification("Ingresa un monto valido para invertir.", "error");
      return;
    }

    const balance = Number(user?.availableBalance ?? 0);
    if (balance < amount) {
      showNotification("Saldo insuficiente para realizar esta operacion.", "error");
      return;
    }

    setIsSubscribeLoading(true);

    try {
      const data = await api.subscribe(token, {
        fundId: String(modal.fund.fundId ?? modal.fund.id),
        amount,
      });

      const notificationSummary = data.notification?.delivered
        ? `Notificacion enviada por ${data.notification.channel}.`
        : data.notification?.reason === "email_confirmation_pending"
          ? "Notificacion pendiente: confirma el correo en AWS SNS."
          : data.notification?.reason === "sns_publish_failed"
            ? `No se pudo enviar SMS (${data.notification?.errorCode ?? "error desconocido"}). Verifica SNS SMS sandbox y formato +57.`
            : data.notification?.reason === "invalid_phone_format"
              ? "No se pudo enviar SMS: formato de telefono invalido."
              : `Notificacion pendiente (${data.notification?.reason ?? "sin detalle"}).`;

      showNotification(`Suscripcion creada. ${notificationSummary}`);
      closeSubscriptionModal();
      await hydrateDashboard(token);
    } catch (error) {
      showNotification(getErrorMessage(error, "No fue posible suscribirse al fondo."), "error");
    } finally {
      setIsSubscribeLoading(false);
    }
  };

  const handleCancelSubscription = async (fundId) => {
    if (!token) {
      showNotification("Debes iniciar sesion.", "error");
      return;
    }

    setCancelingFundId(String(fundId));

    try {
      const data = await api.cancelSubscription(token, fundId);
      setUser((previous) =>
        previous
          ? {
              ...previous,
              availableBalance: data.availableBalance,
            }
          : previous,
      );
      showNotification("Participacion cancelada y saldo reembolsado.");
      await hydrateDashboard(token);
    } catch (error) {
      showNotification(getErrorMessage(error, "No fue posible cancelar la suscripcion."), "error");
    } finally {
      setCancelingFundId("");
    }
  };

  const handleCreateFund = async (payload) => {
    if (!token) {
      showNotification("Debes iniciar sesion.", "error");
      return false;
    }

    setIsCreateFundLoading(true);

    try {
      await api.createFund(token, payload);
      showNotification("Fondo creado correctamente.");
      await hydrateDashboard(token);
      return true;
    } catch (error) {
      showNotification(
        getErrorMessage(error, "No fue posible crear el fondo. Requiere rol ADMIN."),
        "error",
      );
      return false;
    } finally {
      setIsCreateFundLoading(false);
    }
  };

  const handleTopUpBalance = async (amount) => {
    if (!token) {
      showNotification("Debes iniciar sesion.", "error");
      return false;
    }

    setIsTopUpLoading(true);
    try {
      await api.topUpBalance(token, { amount });
      showNotification(`Recarga exitosa por ${formatCurrency(amount)}.`);
      await hydrateDashboard(token);
      return true;
    } catch (error) {
      showNotification(getErrorMessage(error, "No fue posible recargar saldo."), "error");
      return false;
    } finally {
      setIsTopUpLoading(false);
    }
  };

  if (view === "login") {
    return (
      <LoginView
        loginForm={loginForm}
        onChange={handleLoginChange}
        onSubmit={handleLoginSubmit}
        onGoRegister={() => setView("register")}
        isLoading={isAuthLoading}
      />
    );
  }

  if (view === "register") {
    return (
        <RegisterView
          registerForm={registerForm}
        onChange={handleRegisterChange}
        onSubmit={handleRegisterSubmit}
        onGoLogin={() => setView("login")}
        isLoading={isAuthLoading}
      />
    );
  }

  return (
    <div className="app-layout">
      <SideNav view={view} onChangeView={setView} onLogout={() => logout(true)} />

      <main className="app-main">
        <NotificationToast notification={alert} />
        <HeaderBalance view={view} balance={user?.availableBalance ?? 0} />

        {isDataLoading ? (
          <div className="page-loader">Cargando informacion...</div>
        ) : null}

        {view === "dashboard" ? (
          <div className="dashboard-stack">
            <TopUpSection onTopUp={handleTopUpBalance} isLoading={isTopUpLoading} />

            <SubscriptionsSection
              subscriptions={subscriptions}
              onCancel={(subscription) =>
                handleCancelSubscription(String(subscription.fundId ?? subscription.id))
              }
              formatCurrency={formatCurrency}
              cancelingFundId={cancelingFundId}
            />

            <FundsSection
              funds={availableFundsForSubscription}
              onSubscribe={openSubscriptionModal}
              formatCurrency={formatCurrency}
            />

            <AdminFundForm
              visible={user?.role === "ADMIN"}
              onCreate={handleCreateFund}
              isLoading={isCreateFundLoading}
            />
          </div>
        ) : (
          <HistorySection transactions={transactions} formatCurrency={formatCurrency} />
        )}
      </main>

      <SubscriptionModal
        modal={modal}
        onAmountChange={handleSubscriptionAmountChange}
        onConfirm={confirmSubscription}
        onClose={closeSubscriptionModal}
        formatCurrency={formatCurrency}
        isLoading={isSubscribeLoading}
        currentBalance={Number(user?.availableBalance ?? 0)}
      />
    </div>
  );
}

export default App;
