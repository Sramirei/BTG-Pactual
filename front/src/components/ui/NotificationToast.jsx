import { CheckCircle2, X } from "lucide-react";

const NotificationToast = ({ notification }) => {
  if (!notification) {
    return null;
  }

  const isSuccess = notification.type !== "error";

  return (
    <div className={`app-toast ${isSuccess ? "is-success" : "is-error"}`}>
      {isSuccess ? <CheckCircle2 size={18} /> : <X size={18} />}
      <span>{notification.msg}</span>
    </div>
  );
};

export default NotificationToast;
