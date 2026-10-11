"use client";

import { useEffect, useState } from "react";
import { group, parse } from "./calc";

/**
 * Campo numérico con separador de miles. Muestra lo que se escribe tal cual, guarda el número y da formato
 * al salir del campo; si el valor cambia desde fuera (botones + y −, enlace compartido) se reescribe.
 */
export function NumField({
  id,
  value,
  onValue,
  onEnter,
  placeholder,
  invalid,
  describedBy,
  labelledBy,
  disabled,
  align,
}: {
  id: string;
  value: number;
  onValue: (n: number) => void;
  onEnter?: () => void;
  placeholder?: string;
  invalid?: boolean;
  describedBy?: string;
  labelledBy?: string;
  disabled?: boolean;
  align?: "center";
}) {
  const [text, setText] = useState(() => group(value));
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setText((t) => (parse(t) === value ? t : group(value)));
  }, [value]);
  return (
    <input
      id={id}
      value={text}
      inputMode="numeric"
      autoComplete="off"
      placeholder={placeholder}
      disabled={disabled}
      aria-invalid={invalid}
      aria-describedby={describedBy}
      aria-labelledby={labelledBy}
      style={align === "center" ? { textAlign: "center" } : undefined}
      onChange={(e) => {
        setText(e.target.value);
        onValue(parse(e.target.value));
      }}
      onBlur={() => setText(group(parse(text)))}
      onFocus={(e) => e.target.select()}
      onKeyDown={(e) => {
        if (e.key === "Enter" && onEnter) {
          e.preventDefault();
          onEnter();
        }
      }}
    />
  );
}
