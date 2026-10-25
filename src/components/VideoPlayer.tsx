"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowCounterClockwise, Play } from "@phosphor-icons/react";
import { siteConfig } from "@/config/site";
import type { LandingSlug } from "@/content/types";
import { track, trackOnce } from "@/lib/analytics";
import { CtaButton } from "./CtaButton";
import { CtaHint } from "./CtaBlock";

/**
 * El VSL empieza en el segundo 1 (el póster es ese mismo fotograma, así que el paso del póster al vídeo no se nota).
 * Se pide con un fragmento de medio (#t=1, lo entienden Safari, Chrome y Firefox) y, por si acaso, se fija currentTime
 * al cargar los metadatos, antes de que empiece. Los archivos de vídeo no cambian.
 */
const START = 1;
const withStart = (url: string) => `${url}#t=${START}`;

/** Pantallas que reciben la versión ligera del vídeo: móviles en vertical y en horizontal. */
const MOBILE_VIDEO_MEDIA = "(max-width: 767px), (max-height: 500px)";

type Props = {
  src: string;
  /** Versión ligera para móvil. Se elige una sola vez, al asignar el vídeo, según MOBILE_VIDEO_MEDIA. */
  mobileSrc?: string;
  poster: string;
  /**
   * VSL de la primera pantalla: intenta arrancar solo y con sonido. Si el navegador lo bloquea (casi siempre, y siempre
   * en iPhone), espera con el póster y el botón de reproducir. Nunca arranca en silencio.
   */
  autoplay?: boolean;
  /** Eventos de analítica del VSL principal. */
  trackEvents?: boolean;
  /** Segundo en que empieza la llamada a la acción (video_cta_reached). null = no se envía. */
  ctaSecond?: number | null;
  label: string;
  /** Pantalla final: titular y botón de repetir. Sin esto, el vídeo termina sin pantalla final. */
  endCta?: { title: string; replay: string };
  className?: string;
};

export function VideoPlayer({
  src,
  mobileSrc,
  poster,
  autoplay = false,
  trackEvents = false,
  ctaSecond = null,
  label,
  endCta,
  className = "",
}: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  // src asignado (carga diferida). La versión se fija al asignarlo: girar o redimensionar no recarga el vídeo.
  const [armedSrc, setArmedSrc] = useState<string | null>(null);
  const armed = armedSrc !== null;
  const pickSrc = useCallback(
    () => (mobileSrc && window.matchMedia(MOBILE_VIDEO_MEDIA).matches ? mobileSrc : src),
    [src, mobileSrc],
  );
  const setArmed = useCallback(() => setArmedSrc((cur) => cur ?? pickSrc()), [pickSrc]);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [framed, setFramed] = useState(false); // ya hay un fotograma de vídeo: el póster se retira
  const [progress, setProgress] = useState(0);
  const [ended, setEnded] = useState(false);
  const pulsed = useRef(false);

  // Carga diferida: el vídeo no se pide hasta que la página ha terminado de cargar.
  useEffect(() => {
    const arm = () => setArmed();
    const idle = (cb: () => void) => {
      if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(cb, { timeout: 2500 });
      else setTimeout(cb, 1500);
    };
    const go = () => idle(arm);
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => window.removeEventListener("load", go);
  }, [setArmed]);

  // Autoplay con sonido, salvo con movimiento reducido o ahorro de datos. Si el navegador lo bloquea, se queda el póster
  // con el botón de reproducir: no se reintenta en silencio.
  useEffect(() => {
    if (!armed || !autoplay) return;
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduce || saveData) return;
    v.play().catch(() => {
      /* el navegador lo bloquea: queda el botón de reproducir */
    });
  }, [armed, autoplay]);

  // Reproducir (siempre con sonido) o pausar. Si el vídeo aún no tiene src (toque antes de la carga diferida), se le
  // pone aquí mismo para que play() vaya dentro del gesto: iPhone no deja reproducir con sonido fuera de él.
  const togglePlay = () => {
    const v = ref.current;
    if (!v) return;
    if (!armed) {
      v.src = withStart(pickSrc());
      setArmed();
    }
    if (v.paused) void v.play();
    else v.pause();
  };

  const onTimeUpdate = () => {
    const v = ref.current;
    if (!v || !v.duration) return;
    const pct = v.currentTime / v.duration;
    setProgress(pct);
    if (trackEvents && pct >= 0.5) trackOnce("video_50", { video_pct: 50 });
    if (trackEvents && ctaSecond !== null && v.currentTime >= ctaSecond) {
      trackOnce("video_cta_reached", { second: ctaSecond });
      // El botón de debajo del vídeo hace un realce único del resplandor (ver CtaButton)
      if (!pulsed.current) {
        pulsed.current = true;
        window.dispatchEvent(new Event("fivo:video-cta"));
      }
    }
  };

  const replay = () => {
    const v = ref.current;
    if (!v) return;
    setEnded(false);
    v.currentTime = START;
    void v.play();
  };

  const showBigPlay = !playing;

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-[16px] border border-line bg-bg ${className}`}
      data-video-shell
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full object-cover"
        src={armedSrc ? withStart(armedSrc) : undefined}
        preload="metadata"
        playsInline
        aria-label={label}
        onPlaying={() => setFramed(true)}
        onPlay={() => {
          setPlaying(true);
          setStarted(true);
          setEnded(false);
          if (trackEvents) trackOnce("video_play", { muted: ref.current?.muted ?? false });
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          if (endCta && trackEvents) {
            setEnded(true);
            track("video_end_cta_view");
          }
        }}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={() => {
          const v = ref.current;
          if (v && !started && v.currentTime < START) v.currentTime = START;
        }}
      />

      {/* Póster como imagen normal: es el elemento más grande de la primera pantalla y así se pide y se pinta con prioridad */}
      <Image
        src={poster}
        alt=""
        fill
        sizes="(min-width: 1024px) 760px, 100vw"
        preload={autoplay}
        fetchPriority={autoplay ? "high" : undefined}
        loading={autoplay ? "eager" : undefined}
        unoptimized={/^https?:/.test(poster)}
        className="pointer-events-none object-cover transition-opacity duration-300"
        style={{ opacity: framed ? 0 : 1 }}
      />

      {/* Único control: todo el vídeo es un botón (con teclado, Espacio o Enter). Reproduciendo no se ve nada encima; en
          pausa o antes de empezar sale el botón grande del centro */}
      <button
        type="button"
        onClick={togglePlay}
        inert={ended || undefined}
        className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-transparent"
        aria-label={playing ? "Pausar vídeo" : "Reproducir vídeo"}
      >
        {showBigPlay && (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-fg text-bg transition-transform duration-200 sm:h-20 sm:w-20">
            <Play size={30} weight="fill" aria-hidden />
          </span>
        )}
      </button>

      <div className="absolute inset-x-0 bottom-0 z-20 h-[3px] bg-fg/15" aria-hidden>
        <div className="bg-brand-x h-full" style={{ width: `${progress * 100}%` }} />
      </div>
      {endCta && ended && (
        <div
          role="group"
          aria-label={endCta.title}
          className="pane-in absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-glass px-5 text-center backdrop-blur-sm sm:gap-5"
        >
          <p className="font-display text-[clamp(1.375rem,1rem+1.8vw,2.25rem)] font-black leading-[1.1] tracking-[-0.015em]">{endCta.title}</p>
          <div className="flex flex-col items-center gap-2.5 sm:flex-row sm:gap-3">
            <CtaButton position="video_end" size="lg" />
            <button type="button" onClick={replay} className="btn-ghost">
              <ArrowCounterClockwise size={18} aria-hidden />
              {endCta.replay}
            </button>
          </div>
          <CtaHint className="max-sm:hidden" />
        </div>
      )}
      <span className="sr-only" aria-live="polite">
        {started ? (playing ? "Reproduciendo" : "En pausa") : ""}
      </span>
    </div>
  );
}

/** Configuración del VSL principal de cada landing, con sustitutos mientras no haya vídeo real. */
export function MainVsl({ slug, label, endCta }: { slug: LandingSlug; label: string; endCta?: { title: string; replay: string } }) {
  const { video } = siteConfig.landings[slug];
  return (
    <VideoPlayer
      src={video.src || "/video/placeholder.mp4"}
      mobileSrc={video.mobileSrc || undefined}
      poster={video.poster || "/img/video-poster.webp"}
      autoplay
      trackEvents
      ctaSecond={video.ctaSecond}
      label={label}
      endCta={endCta}
    />
  );
}
