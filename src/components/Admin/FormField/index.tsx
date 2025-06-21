import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import styles from "./FormField.module.scss";

interface FormFieldProps {
  label: string;
  type: "text" | "email" | "url" | "number" | "textarea";
  value: string | number;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  description?: string;
  rows?: number;
  min?: string;
  max?: string;
  step?: string;
}

export default function FormField({
  label,
  type,
  value,
  onChange,
  disabled = false,
  placeholder,
  required = false,
  description,
  rows = 4,
  min,
  max,
  step,
}: FormFieldProps) {
  const { theme } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const inputProps = {
    value: value || "",
    onChange: handleChange,
    disabled,
    placeholder,
    required,
    min,
    max,
    step,
    className: `${styles.input} ${disabled ? styles.disabled : ""}`,
  };

  return (
    <div className={`${styles.formField} ${styles[theme]}`}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      
      {type === "textarea" ? (
        <textarea
          {...inputProps}
          rows={rows}
          className={`${styles.textarea} ${disabled ? styles.disabled : ""}`}
        />
      ) : (
        <input
          {...inputProps}
          type={type}
        />
      )}
      
      {description && (
        <p className={styles.description}>{description}</p>
      )}
    </div>
  );
}
