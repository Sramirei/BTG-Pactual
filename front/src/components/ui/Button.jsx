const VARIANT_CLASS = {
  primary: "ui-btn-primary",
  secondary: "ui-btn-secondary",
  danger: "ui-btn-danger",
};

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
}) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={`ui-btn ${VARIANT_CLASS[variant] ?? VARIANT_CLASS.primary} ${className}`}
  >
    {children}
  </button>
);

export default Button;
