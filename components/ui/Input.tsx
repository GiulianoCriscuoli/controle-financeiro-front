import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, id, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-dark">
        {label}
      </label>
      <input
        id={id}
        className={`rounded-lg border border-primary px-4 py-2 outline-none focus:ring-2 focus:ring-primary/30 ${className}`}
        {...props}
      />
    </div>
  );
}