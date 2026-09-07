import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import styles from "./checkout.module.css";

type FieldProps = {
  id: string;
  label: string;
  value: string;
  error?: string;
  optionalLabel?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "value">;

export function CheckoutField({
  id,
  label,
  value,
  error,
  optionalLabel,
  className,
  ...props
}: FieldProps) {
  return (
    <div className={cn(styles.field, className)}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {optionalLabel ? (
          <span className={styles.optional}>{` (${optionalLabel})`}</span>
        ) : null}
      </label>
      <input
        className={cn(styles.input, error && styles.inputError)}
        id={id}
        value={value}
        {...props}
      />
      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}

type SelectProps = {
  id: string;
  label: string;
  value: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "value">;

export function CheckoutSelect({
  id,
  label,
  value,
  error,
  options,
  className,
  ...props
}: SelectProps) {
  return (
    <div className={cn(styles.field, className)}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <select
        className={cn(styles.select, error && styles.selectError)}
        id={id}
        value={value}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}
