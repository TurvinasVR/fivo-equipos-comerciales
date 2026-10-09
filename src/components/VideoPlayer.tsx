"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowCounterClockwise, ClosedCaptioning, Pause, Play, SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import { siteConfig } from "@/config/site";
import type { LandingSlug } from "@/content/types";
import { track, trackOnce } from "@/lib/analytics";
import { CtaButton } from "./CtaButton";
import { CtaHint } from "./CtaBlock";
import { PendingTag } from "./PendingTag";

type Props = {
  src: string;
  poster: string;
  captions: string;
  /** Empieza solo y en silencio (VSL de la primera pantalla). */
  autoplayMuted?: boolean;
  /** Eventos de analítica del VSL principal. */
  trackEvents?: boolean;
  /** Segundo en que empieza la llamada a la acción (video_cta_reached). null = no se envía. */
  ctaSecond?: number | null;
  label: string;
  /** Pantalla final: titular y botón de repetir. Sin esto, el vídeo termina sin pantalla final. */
  endCta?: { title: string; replay: string };
  pendingNote?: string;
  className?: string;
};

export function VideoPlayer({
  src,
  poster,
  captions,
  autoplayMuted = false,
  trackEvents = false,
  ctaSecond = null,
  label,
  endCta,
  pendingNote,
  className = "",
}: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [armed, setArmed] = useState(false); // src asignado (carga diferida)
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [framed, setFramed] = useState(false); // ya hay un fotograma de vídeo: el póster se retira
  const [muted, setMuted] = useState(true);
  const [ccOn, setCcOn] = useState(true);
  const [progress, setProgress] = useState(0);
  const [ended, setEnded] = useState(false);
  const pulsed = useRef(false);

  // Carga diferida: el vídeo no se pide hasta que la página ha terminado de cargar.
  useEffect(() => {
    const arm = () => setArmed(true);
    const idle = (cb: () => void) => {
      if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(cb, { timeout: 2500 });
      else setTimeout(cb, 1500);
    };
    const go = () => idle(arm);
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => window.removeEventListener("load", go);
  }, []);

  // Autoplay en silencio, salvo con movimiento reducido o ahorro de datos.
  useEffect(() => {
    if (!armed || !autoplayMuted) return;
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduce || saveData) return;
    v.muted = true;
    v.play().catch(() => {
      /* el navegador lo bloquea: queda el botón de reproducir */
    });
  }, [armed, autoplayMuted]);

  // Subtítulos propios: el navegador no los dibuja (su caja nativa provocaba un salto de CLS al arrancar);
  // la pista queda en "hidden" y sus frases se pintan en una capa absoluta.
  const [cue, setCue] = useState("");
  const applyCaptions = useCallback(() => {
    const t = ref.current?.textTracks[0];
    if (!t) return;
    t.mode = "hidden";
    t.oncuechange = () => setCue(Array.from(t.activeCues ?? []).map((c) => (c as VTTCue).text.replace(/<[^>]+>/g, "")).join(" "));
  }, []);

  useEffect(() => {
    applyCaptions();
  }, [applyCaptions, armed]);

  const toggleMain = () => {
    const v = ref.current;
    if (!v) {
      setArmed(true);
      return;
    }
    if (!armed) setArmed(true);
    // Primer toque con sonido apagado: se activa el sonido y sigue reproduciendo.
    if (playing && v.muted) {
      v.muted = false;
      setMuted(false);
      return;
    }
    if (v.paused) {
      v.muted = false;
      setMuted(false);
      void v.play();
    } else {
      v.pause();
    }
  };

  const togglePlay = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  };

  const toggleMute = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
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
    v.currentTime = 0;
    void v.play();
  };

  const showAudioHint = playing && muted && !ended;
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
        src={armed ? src : undefined}
        preload="none"
        muted
        playsInline
        aria-label={label}
        onPlaying={() => setFramed(true)}
        onPlay={() => {
          setPlaying(true);
          setStarted(true);
          setEnded(false);
          if (trackEvents) trackOnce("video_play", { muted: ref.current?.muted ?? true });
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
        onLoadedMetadata={applyCaptions}
      >
        {captions && <track kind="captions" srcLang="es" label="Español" src={captions} default />}
      </video>

      {/* Póster como imagen normal: es el elemento más grande de la primera pantalla y así se pide y se pinta con prioridad */}
      <Image
        src={poster}
        alt=""
        fill
        sizes="(min-width: 1024px) 760px, 100vw"
        preload={autoplayMuted}
        fetchPriority={autoplayMuted ? "high" : undefined}
        loading={autoplayMuted ? "eager" : undefined}
        unoptimized={/^https?:/.test(poster)}
        className="pointer-events-none object-cover transition-opacity duration-300"
        style={{ opacity: framed ? 0 : 1 }}
      />

      {/* Superficie principal: reproducir, o activar el sonido si va en silencio */}
      <button
        type="button"
        onClick={toggleMain}
        tabIndex={-1}
        inert={ended || undefined}
        className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-transparent"
        aria-label={showAudioHint ? "Activar el sonido" : playing ? "Pausar el vídeo" : "Reproducir el vídeo"}
      >
        {showBigPlay && (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-fg text-bg transition-transform duration-200 sm:h-20 sm:w-20">
            <Play size={30} weight="fill" aria-hidden />
          </span>
        )}
      </button>

      {showAudioHint && (
        <div className="pointer-events-none absolute left-3 top-3 z-20 flex items-center gap-2 rounded-full bg-glass px-3.5 py-2 text-sm font-medium text-fg backdrop-blur-sm sm:left-4 sm:top-4">
          <SpeakerSlash size={18} weight="bold" aria-hidden />
          Pulsa para oír
        </div>
      )}

      {ccOn && cue && (
        <div aria-hidden className="pointer-events-none absolute inset-x-4 bottom-5 z-20 flex justify-center">
          <span className="max-w-full whitespace-pre-line rounded-[8px] bg-glass px-3 py-1.5 text-center text-[15px] leading-snug text-fg sm:text-[17px]">{cue}</span>
        </div>
      )}

      {pendingNote && (
        <div className="pointer-events-none absolute left-3 top-14 z-20 sm:left-4 sm:top-16">
          <PendingTag>{pendingNote}</PendingTag>
        </div>
      )}

      {/* Controles: pausar, sonido y subtítulos */}
      <div inert={ended || undefined} className="absolute right-2 top-2 z-20 flex items-center gap-0.5 rounded-full bg-glass p-0.5 backdrop-blur-sm sm:right-3 sm:top-3">
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-11 w-11 items-center justify-center rounded-full text-fg hover:bg-fg/15"
          aria-label={playing ? "Pausar" : "Reproducir"}
        >
          {playing ? <Pause size={20} weight="fill" aria-hidden /> : <Play size={20} weight="fill" aria-hidden />}
        </button>
        <button
          type="button"
          onClick={toggleMute}
          className="flex h-11 w-11 items-center justify-center rounded-full text-fg hover:bg-fg/15"
          aria-label={muted ? "Activar el sonido" : "Silenciar"}
          aria-pressed={!muted}
        >
          {muted ? <SpeakerSlash size={20} aria-hidden /> : <SpeakerHigh size={20} aria-hidden />}
        </button>
        <button
          type="button"
          onClick={() => setCcOn((v) => !v)}
          className={`flex h-11 w-11 items-center justify-center rounded-full hover:bg-fg/15 ${ccOn ? "text-accent" : "text-fg"}`}
          aria-label="Subtítulos"
          aria-pressed={ccOn}
        >
          <ClosedCaptioning size={22} weight={ccOn ? "fill" : "regular"} aria-hidden />
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 h-[3px] bg-fg/15" aria-hidden>
        <div className="h-full bg-accent" style={{ width: `${progress * 100}%` }} />
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
  const { video, ready } = siteConfig.landings[slug];
  return (
    <VideoPlayer
      src={video.src || "/video/placeholder.mp4"}
      poster={video.poster || "/img/video-poster.webp"}
      captions={video.captions || "/video/placeholder-es.vtt"}
      autoplayMuted
      trackEvents
      ctaSecond={video.ctaSecond}
      label={label}
      endCta={endCta}
      pendingNote={ready.video ? undefined : "vídeo de sustitución"}
    />
  );
}
