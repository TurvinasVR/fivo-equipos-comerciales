"use client";

import { useRef, useState } from "react";
import { CalendarCheck, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { siteConfig } from "@/config/site";
import { qualification } from "@/config/qualification";
import type { LandingContent } from "@/content/types";
import { track } from "@/lib/analytics";
import { lines, rich } from "@/lib/rich";
import { captureUtm } from "@/lib/utm";
import { SUBMIT_LABEL } from "../CtaButton";
import { useLanding } from "../landing/LandingContext";

export type LeadValues = Record<string, string>;

/** Valores vacíos de todos los campos de la landing. */
export function emptyLead(content: LandingContent): LeadValues {
  const v: LeadValues = { nombre: "", email: "", whatsapp: "" };
  content.booking.form.choices.forEach((c) => (v[c.name] = ""));
  return v;
}

type Errors = Record<string, string | undefined>;

/** Rejillas de las tarjetas de selección (clases completas para que Tailwind las encuentre). */
const GRID = {
  "2/4": "grid grid-cols-2 gap-2 sm:grid-cols-4",
  "1/3": "grid grid-cols-1 gap-2 sm:grid-cols-3",
  /** Tres tarjetas del mismo alto aunque una de ellas pase a dos líneas */
  "1/3=": "grid grid-cols-1 gap-2 sm:grid-cols-3 [&>.seg>span]:h-full",
  "1/2": "grid grid-cols-1 gap-2 sm:grid-cols-2",
} as const;

export function validateField(content: LandingContent, k: string, v: LeadValues): string | undefined {
  switch (k) {
    case "nombre":
      return v.nombre.trim().length < 2 ? "Escribe tu nombre." : undefined;
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim()) ? undefined : "Escribe un email válido, por ejemplo nombre@empresa.com.";
    case "whatsapp":
      return /^\d{9,15}$/.test(v.whatsapp.replace(/[\s\-().+]/g, "")) ? undefined : "Escribe un número válido. Si no es de España, añade el prefijo.";
    default: {
      const c = content.booking.form.choices.find((x) => x.name === k);
      return c && !v[k] ? c.error : undefined;
    }
  }
}

export function validate(content: LandingContent, v: LeadValues): Errors {
  const e: Errors = {};
  Object.keys(v).forEach((k) => {
    const m = validateField(content, k, v);
    if (m) e[k] = m;
  });
  return e;
}

type Props = { values: LeadValues; onChange: (v: LeadValues) => void; onSubmitted: (values: LeadValues) => void };

export function LeadForm({ values, onChange, onSubmitted }: Props) {
  const content = useLanding();
  const { slug, booking } = content;
  const { form: formContent } = booking;
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const started = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  const set = (k: string, val: string) => {
    const next = { ...values, [k]: val };
    onChange(next);
    if (errors[k]) setErrors((s) => ({ ...s, [k]: validateField(content, k, next) }));
  };
  const blur = (k: string) => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors((s) => ({ ...s, [k]: validateField(content, k, values) }));
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const form = formRef.current;
    // Trampa para bots: si se rellena, se descarta en silencio.
    if (form && (form.elements.namedItem("empresa_web") as HTMLInputElement | null)?.value) return;

    const found = validate(content, values);
    setErrors(found);
    setTouched(Object.fromEntries(Object.keys(values).map((k) => [k, true])));
    const firstBad = Object.keys(found)[0];
    if (firstBad) {
      form?.querySelector<HTMLElement>(`[name="${firstBad}"]`)?.focus();
      return;
    }

    setStatus("submitting");
    const payload = {
      ...values,
      nombre: values.nombre.trim(),
      email: values.email.trim(),
      whatsapp: values.whatsapp.trim(),
      ...captureUtm(),
      pagina: window.location.href,
      referrer: document.referrer || undefined,
      enviado_en: new Date().toISOString(),
      origen: slug,
    };

    try {
      if (siteConfig.formWebhookUrl) {
        const res = await fetch(siteConfig.formWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        });
        if (!res.ok) throw new Error(`webhook ${res.status}`);
      } else {
        // Sin webhook configurado: envío simulado.
        await new Promise((r) => setTimeout(r, 600));
        if (process.env.NODE_ENV !== "production") console.info("[formulario simulado]", payload);
      }
      track("form_submit", Object.fromEntries(Object.entries(formContent.analytics.submit).map(([param, field]) => [param, values[field]])));
      setStatus("idle");
      onSubmitted(values);
    } catch {
      setStatus("error");
    }
  };

  const errId = (k: string) => `err-${k}`;
  const bad = (k: string) => Boolean(errors[k]);
  const good = (k: string) => Boolean(touched[k]) && !errors[k] && Boolean(values[k]);

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={submit}
      onFocusCapture={() => {
        if (!started.current) {
          started.current = true;
          track("form_start");
        }
      }}
      className="relative space-y-5"
      aria-describedby={status === "error" ? "form-error" : undefined}
    >
      <Field label="Nombre" name="nombre" error={errors.nombre} errId={errId("nombre")} ok={good("nombre")}>
        <input
          className="field field--lg"
          id="nombre"
          name="nombre"
          type="text"
          autoComplete="name"
          value={values.nombre}
          onChange={(e) => set("nombre", e.target.value)}
          onBlur={() => blur("nombre")}
          aria-invalid={bad("nombre")}
          aria-describedby={bad("nombre") ? errId("nombre") : undefined}
          required
        />
      </Field>

      <Field label={formContent.emailLabel} name="email" error={errors.email} errId={errId("email")} ok={good("email")}>
        <input
          className="field field--lg"
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          onBlur={() => blur("email")}
          aria-invalid={bad("email")}
          aria-describedby={bad("email") ? errId("email") : undefined}
          required
        />
      </Field>

      <Field label="WhatsApp" name="whatsapp" error={errors.whatsapp} errId={errId("whatsapp")} ok={good("whatsapp")} help={lines(formContent.whatsappHelp)}>
        <input
          className="field field--lg"
          id="whatsapp"
          name="whatsapp"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={values.whatsapp}
          onChange={(e) => set("whatsapp", e.target.value)}
          onBlur={() => blur("whatsapp")}
          aria-invalid={bad("whatsapp")}
          aria-describedby={`help-whatsapp${bad("whatsapp") ? ` ${errId("whatsapp")}` : ""}`}
          required
        />
      </Field>

      {formContent.choices.map((c) => {
        const options = qualification[slug].options[c.options];
        if (c.control === "select") {
          return (
            <Field key={c.name} label={c.label} name={c.name} error={errors[c.name]} errId={errId(c.name)} ok={good(c.name)}>
              <select
                className="field field--lg"
                id={c.name}
                name={c.name}
                value={values[c.name]}
                onChange={(e) => set(c.name, e.target.value)}
                onBlur={() => blur(c.name)}
                aria-invalid={bad(c.name)}
                aria-describedby={bad(c.name) ? errId(c.name) : undefined}
                required
              >
                <option value="" disabled>
                  {c.placeholder}
                </option>
                {options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          );
        }
        return (
          <fieldset key={c.name}>
            <legend className="field-label">{c.label}</legend>
            <div className={`seg-group ${GRID[c.layout ?? "1/3"]}`} data-invalid={bad(c.name)}>
              {options.map((o, i) => (
                <label key={o.value} className="seg">
                  <input
                    type="radio"
                    name={c.name}
                    value={o.value}
                    checked={values[c.name] === o.value}
                    onChange={() => {
                      set(c.name, o.value);
                      setTouched((t) => ({ ...t, [c.name]: true }));
                    }}
                    aria-describedby={bad(c.name) ? errId(c.name) : c.help ? `help-${c.name}` : undefined}
                    required={i === 0}
                  />
                  <span>{o.label}</span>
                </label>
              ))}
            </div>
            {c.help && (
              <p id={`help-${c.name}`} className="mt-2 text-[13px] text-fg-muted">
                {rich(c.help)}
              </p>
            )}
            <FieldError id={errId(c.name)} message={errors[c.name]} />
          </fieldset>
        );
      })}

      {/* Trampa para bots: invisible para personas */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          No rellenar
          <input type="text" name="empresa_web" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {status === "error" && (
        <p id="form-error" role="alert" className="flex items-start gap-2.5 text-[15px] text-danger">
          <WarningCircle size={22} weight="fill" className="mt-px shrink-0" aria-hidden />
          No hemos podido enviar tus datos. Comprueba la conexión y vuelve a pulsar el botón.
        </p>
      )}

      <div>
        <button type="submit" className="btn-cta btn-cta--lg w-full" disabled={status === "submitting"} aria-busy={status === "submitting"}>
          {status === "submitting" ? <span className="spinner" aria-hidden /> : <CalendarCheck size={22} aria-hidden />}
          {status === "submitting" ? "Enviando" : SUBMIT_LABEL}
        </button>
        <p className="mt-3 text-center text-sm text-fg-muted">{formContent.submitHint}</p>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  errId,
  help,
  ok,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  errId: string;
  help?: React.ReactNode;
  ok?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="field-label">
        {label}
      </label>
      <div className="relative" data-ok={ok ? "1" : "0"}>
        {children}
        {ok && <CheckCircle size={20} weight="fill" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-success" aria-hidden />}
      </div>
      {help && (
        <p id={`help-${name}`} className="mt-1.5 text-[13px] leading-snug text-fg-muted">
          {help}
        </p>
      )}
      <FieldError id={errId} message={error} />
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 flex items-start gap-1.5 text-[14px] text-danger" role="alert">
      <WarningCircle size={18} weight="fill" className="mt-0.5 shrink-0" aria-hidden />
      {message}
    </p>
  );
}
