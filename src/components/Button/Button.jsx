import { cn } from "../../shared/utils/cn";

const Button = ({
  children,
  variant = 'default',
  size = 'default',
  className,
  onClick,
  disabled = false,
  ...props
}) => {
  const variants = {
    default: "bg-bright-orange text-white hover:bg-[#FF6A00]",
    outline: "border-2 border-bright-blue bg-white text-bright-blue hover:bg-sky-blue",
    ghost: "hover:bg-sky-blue text-night-blue",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3 text-sm",
    lg: "h-11 px-8 text-base",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-bright-blue focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;