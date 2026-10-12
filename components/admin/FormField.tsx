import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  english?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

/** Labeled wrapper for admin form inputs (Bengali label + small English). */
export function FormField({
  label,
  english,
  hint,
  error,
  required,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-900 dark:text-neutral-100">
        {label}
        {required ? <span className="ml-1 text-rose-600">*</span> : null}
        {english ? (
          <span className="ml-2 text-xs font-normal text-neutral-500 dark:text-neutral-400">
            {english}
          </span>
        ) : null}
      </label>
      {children}
      {hint ? (
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>
      ) : null}
    </div>
  );
}
