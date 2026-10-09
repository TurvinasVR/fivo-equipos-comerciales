import { showPending } from "@/lib/pending";

/** Marcador visible solo en desarrollo. Cada uno está anotado en PENDIENTES.md. */
export function PendingTag({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  if (!showPending) return null;
  return <span className={`pending-tag ${className}`}>PENDIENTE: {children}</span>;
}
