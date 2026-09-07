import { SelectHTMLAttributes } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
}

export function Select({
  label,
  id,
  error,
  options,
  placeholder,
  className = "",
  ...props
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-dark">
          {label}
        </label>
      )}
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        className={`rounded-lg border bg-white px-4 py-2 outline-none focus:ring-2 ${
          error
            ? "border-red-500 focus:ring-red-500/30"
            : "border-primary focus:ring-primary/30"
        } ${className}`}
        {...props}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs font-medium text-red-600">{error}</span>
      )}
    </div>
  );
}
