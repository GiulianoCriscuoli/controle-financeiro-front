import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`w-full rounded-lg bg-primary py-3 font-semibold text-dark transition hover:brightness-95 disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}