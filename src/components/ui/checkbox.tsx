import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./checkbox.module.css";

type CheckboxProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  className?: string;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "checked" | "onChange" | "type" | "children" | "className"
>;

export function Checkbox({
  id,
  checked,
  onChange,
  children,
  className,
  ...props
}: CheckboxProps) {
  return (
    <label className={cn(styles.root, className)} htmlFor={id}>
      <input
        checked={checked}
        className={styles.input}
        id={id}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
        {...props}
      />
      <span aria-hidden="true" className={styles.box}>
        <svg
          aria-hidden="true"
          className={styles.mark}
          fill="none"
          viewBox="0 0 18 18"
        >
          <path
            d="M3.6 9.2 7.3 12.8 14.4 5.2"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.2"
          />
        </svg>
      </span>
      <span className={styles.label}>{children}</span>
    </label>
  );
}
