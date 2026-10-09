import type { Metadata } from "next";
import { Landing } from "@/components/landing/Landing";
import { LANDING } from "@/content/index";
import { landingMetadata } from "@/content/meta";
import { ACTIVE_LANDING } from "@/lib/activeLanding";

// La raíz muestra la landing de equipos comerciales
export const metadata: Metadata = landingMetadata(ACTIVE_LANDING);

export default function Home() {
  return <Landing content={LANDING} />;
}
