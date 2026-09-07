import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, id, error, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-dark">
          {label}
        </label>
      )}
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`rounded-lg border px-4 py-2 outline-none focus:ring-2 ${
          error
            ? "border-red-500 focus:ring-red-500/30"
            : "border-primary focus:ring-primary/30"
        } ${className}`}
        {...props}
      />
      {error && (
        <span id={`${id}-error`} className="text-xs font-medium text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}
