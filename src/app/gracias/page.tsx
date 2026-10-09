import type { Metadata } from "next";
import { ThanksPage } from "@/components/landing/ThanksPage";
import { LANDING } from "@/content/index";

export const metadata: Metadata = {
  title: "Tu llamada está agendada | Fivo",
  robots: { index: false, follow: false },
};

// La página de gracias de la landing de equipos comerciales
export default function Gracias() {
  return <ThanksPage content={LANDING} />;
}
