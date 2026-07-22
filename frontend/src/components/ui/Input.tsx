import type { InputHTMLAttributes } from "react";
import "./Input.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, id, className = "", ...props }: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`input-group ${className}`}>
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} className={error ? "has-error" : ""} {...props} />
      {error ? <span className="input-error">{error}</span> : null}
    </div>
  );
}

interface TextAreaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  rows?: number;
}

export function TextArea({ label, error, id, rows = 5, className = "", ...props }: TextAreaProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`input-group ${className}`}>
      <label htmlFor={inputId}>{label}</label>
      <textarea id={inputId} rows={rows} className={error ? "has-error" : ""} {...props} />
      {error ? <span className="input-error">{error}</span> : null}
    </div>
  );
}
