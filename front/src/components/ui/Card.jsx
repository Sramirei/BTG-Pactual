const Card = ({ children, className = "" }) => (
  <div className={`ui-card ${className}`}>{children}</div>
);

export default Card;
