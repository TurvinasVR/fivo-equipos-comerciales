import { jsPDF } from "jspdf";

/**
 * PDF del cálculo, generado en el navegador con jsPDF. Este módulo (y jsPDF y las fuentes) solo se descarga al pulsar el
 * botón: ver engine.ts. Las cifras y los textos llegan ya formateados por la calculadora, así que son los de la pantalla.
 */

export type PdfLine = {
  k: "group" | "row" | "sub" | "cost" | "total";
  label: string;
  note?: string;
  tag?: string;
  amt?: string;
  neg?: boolean;
};

export type PdfModel = {
  inputs: { label: string; value: string }[];
  assumptions: { label: string; value: string }[];
  result: { netLabel: string; net: string; netNeg: boolean; stats: { label: string; value: string; sub?: string }[]; price: string };
  lines: PdfLine[];
  how: { intro: string; check: string; billing: string; billingNote: string; estimate: string };
  disclaimer: string;
  /** Fecha y hora de la llamada, ya con formato; null si no la tenemos. */
  callWhen: string | null;
};

// A4, en milímetros
const W = 210;
const H = 297;
const M = 18;
const CW = W - M * 2;
const TOP = 20;
const BOTTOM = 18;

const INK: [number, number, number] = [11, 16, 32];
const MUTED: [number, number, number] = [91, 98, 117];
const LINE: [number, number, number] = [221, 225, 233];
const SOFT: [number, number, number] = [244, 246, 250];
const GROUP: [number, number, number] = [234, 239, 255];
const NEG: [number, number, number] = [190, 52, 60];
const BRAND_A: [number, number, number] = [82, 113, 255]; // brand-start #5271FF
const BRAND_B: [number, number, number] = [0, 201, 255]; // brand-end #00C9FF

const FONTS: [file: string, family: string, style: string][] = [
  ["Manrope-Regular.ttf", "Manrope", "normal"],
  ["Manrope-SemiBold.ttf", "ManropeSemi", "normal"],
  ["Manrope-Bold.ttf", "Manrope", "bold"],
  ["Satoshi-Bold.ttf", "Satoshi", "bold"],
  ["Satoshi-Black.ttf", "SatoshiBlack", "normal"],
];

function toBase64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

async function loadFonts(doc: jsPDF) {
  const bufs = await Promise.all(
    FONTS.map(async ([file]) => {
      const res = await fetch(`/fonts/pdf/${file}`);
      if (!res.ok) throw new Error(`fuente ${file}: ${res.status}`);
      return res.arrayBuffer();
    }),
  );
  FONTS.forEach(([file, family, style], i) => {
    doc.addFileToVFS(file, toBase64(bufs[i]));
    doc.addFont(file, family, style);
  });
}

/** El logotipo de Fivo del encabezado (blanco) pasado a tinta oscura, como imagen, para el papel. */
async function loadLogo(): Promise<{ data: string; w: number; h: number } | null> {
  try {
    const svg = (await (await fetch("/logos/fivo-wordmark-white.svg")).text()).replace(/fill="(white|#fff|#ffffff)"/gi, 'fill="#0B1020"');
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    const img = new Image();
    await new Promise<void>((ok, ko) => {
      img.onload = () => ok();
      img.onerror = () => ko(new Error("logo"));
      img.src = url;
    });
    const k = 6; // píxeles por unidad del SVG (103 x 33)
    const c = document.createElement("canvas");
    c.width = 103 * k;
    c.height = 33 * k;
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(url);
    return { data: c.toDataURL("image/png"), w: 103, h: 33 };
  } catch {
    return null;
  }
}

export async function buildCalculatorPdf(m: PdfModel): Promise<Blob> {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  doc.setProperties({ title: "Tu cálculo con Fivo", author: "Fivo", creator: "Fivo" });
  const [, logo] = await Promise.all([loadFonts(doc), loadLogo()]);

  let y = TOP;
  const color = (c: [number, number, number]) => doc.setTextColor(c[0], c[1], c[2]);
  const font = (family: string, style: "normal" | "bold", size: number) => {
    doc.setFont(family, style);
    doc.setFontSize(size);
  };
  const body = () => { font("Manrope", "normal", 9.5); color(INK); };
  const lh = (size: number) => size * 0.3528 * 1.38; // alto de línea en mm

  // Línea fina con el degradado de marca (tramos de color: sin dependencias de degradados del PDF)
  const gradLine = (x: number, yy: number, w: number, h: number) => {
    const n = 90;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      doc.setFillColor(...(BRAND_A.map((a, j) => Math.round(a + (BRAND_B[j] - a) * t)) as [number, number, number]));
      doc.rect(x + (w * i) / n, yy, w / n + 0.15, h, "F");
    }
  };

  const pageTop = () => gradLine(0, 0, W, 1.4);
  pageTop();

  const newPage = () => {
    doc.addPage();
    pageTop();
    y = TOP;
  };
  const ensure = (h: number) => {
    if (y + h > H - BOTTOM) newPage();
  };

  const wrap = (text: string, width: number, family: string, style: "normal" | "bold", size: number): string[] => {
    font(family, style, size);
    return doc.splitTextToSize(text, width) as string[];
  };

  const heading = (text: string) => {
    ensure(16);
    y += 5;
    font("Satoshi", "bold", 13);
    color(INK);
    doc.text(text, M, y);
    y += 2.2;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.25);
    doc.line(M, y, M + CW, y);
    y += 5;
  };

  const paragraph = (text: string, opts: { size?: number; family?: string; style?: "normal" | "bold"; c?: [number, number, number]; gap?: number } = {}) => {
    const size = opts.size ?? 9.5;
    const lines = wrap(text, CW, opts.family ?? "Manrope", opts.style ?? "normal", size);
    const step = lh(size);
    color(opts.c ?? INK);
    for (const l of lines) {
      ensure(step);
      doc.text(l, M, y + step * 0.75);
      y += step;
    }
    y += opts.gap ?? 2;
  };

  // ---- 1. Logo, título y fecha ----
  if (logo) doc.addImage(logo.data, "PNG", M, y - 2, 30, (30 * logo.h) / logo.w);
  const hoy = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(new Date());
  font("Manrope", "normal", 9.5);
  color(MUTED);
  doc.text(hoy, M + CW, y + 5, { align: "right" });
  y += 18;
  font("SatoshiBlack", "normal", 26);
  color(INK);
  doc.text("Tu cálculo con Fivo", M, y);
  y += 4;

  // ---- 2. Datos ----
  const pairRows = (rows: { label: string; value: string }[]) => {
    for (const r of rows) {
      const labW = CW * 0.58;
      const l = wrap(r.label, labW, "Manrope", "normal", 9.5);
      const v = wrap(r.value, CW - labW - 4, "Manrope", "bold", 9.5);
      const n = Math.max(l.length, v.length);
      const step = lh(9.5);
      ensure(n * step + 2.6);
      font("Manrope", "normal", 9.5);
      color(MUTED);
      l.forEach((t, i) => doc.text(t, M, y + step * 0.75 + i * step));
      font("Manrope", "bold", 9.5);
      color(INK);
      v.forEach((t, i) => doc.text(t, M + CW, y + step * 0.75 + i * step, { align: "right" }));
      y += n * step + 1.3;
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.15);
      doc.line(M, y, M + CW, y);
      y += 1.3;
    }
  };
  heading("Tus datos");
  pairRows(m.inputs);
  if (m.assumptions.length) {
    y += 3;
    font("Manrope", "bold", 9.5);
    color(INK);
    ensure(10);
    doc.text("Supuestos", M, y + 3);
    y += 6;
    pairRows(m.assumptions);
  }

  // ---- 3. Resultado ----
  heading("Resultado");
  const statCount = m.result.stats.length;
  const boxH = 24 + 22;
  ensure(boxH + 10);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, y, CW, boxH, 2.5, 2.5, "S");
  font("Manrope", "normal", 9.5);
  color(MUTED);
  doc.text(m.result.netLabel, M + 6, y + 8);
  // Cifra del beneficio neto: texto recortado con el degradado de marca (en negativo, el rojo del sistema)
  const bigY = y + 20;
  font("SatoshiBlack", "normal", 34);
  if (m.result.netNeg) {
    color(NEG);
    doc.text(m.result.net, M + 6, bigY);
  } else {
    const width = doc.getTextWidth(m.result.net);
    doc.saveGraphicsState();
    doc.text(m.result.net, M + 6, bigY, { renderingMode: "addToPathForClipping" });
    const n = 70;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      doc.setFillColor(...(BRAND_A.map((a, j) => Math.round(a + (BRAND_B[j] - a) * t)) as [number, number, number]));
      doc.rect(M + 6 + (width * i) / n, bigY - 14, width / n + 0.2, 18, "F");
    }
    doc.restoreGraphicsState();
  }
  const colW = (CW - 12) / statCount;
  m.result.stats.forEach((s, i) => {
    const x = M + 6 + i * colW;
    font("Manrope", "normal", 8.5);
    color(MUTED);
    doc.text(s.label, x, y + 31);
    font("Satoshi", "bold", 14);
    color(INK);
    doc.text(s.value, x, y + 38);
    if (s.sub) {
      font("Manrope", "normal", 8);
      color(MUTED);
      doc.text(s.sub, x, y + 43);
    }
  });
  y += boxH + 4;
  paragraph(m.result.price, { size: 9, c: MUTED });

  // ---- 4. Desglose ----
  heading("Desglose");
  const AMT_W = 34;
  const LAB_W = CW - AMT_W - 4;
  for (const ln of m.lines) {
    const bold = ln.k !== "row";
    const size = ln.k === "total" ? 11 : 9.5;
    const labelLines = wrap(ln.label, LAB_W - (ln.k === "row" ? 0 : 4), "Manrope", bold ? "bold" : "normal", size);
    const noteText = ln.note ? (ln.tag ? `${ln.tag} · ${ln.note}` : ln.note) : "";
    const noteLines = noteText ? wrap(noteText, LAB_W - 4, "Manrope", "normal", 8) : [];
    const step = lh(size);
    const h = labelLines.length * step + noteLines.length * lh(8) + 3.4;
    ensure(h);
    if (ln.k === "group") {
      doc.setFillColor(...GROUP);
      doc.rect(M, y, CW, h, "F");
    } else if (ln.k === "sub") {
      doc.setFillColor(...SOFT);
      doc.rect(M, y, CW, h, "F");
    } else if (ln.k === "total") {
      doc.setDrawColor(...INK);
      doc.setLineWidth(0.5);
      doc.line(M, y, M + CW, y);
      doc.line(M, y + h, M + CW, y + h);
    } else {
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.15);
      doc.line(M, y + h, M + CW, y + h);
    }
    const x0 = ln.k === "row" ? M : M + 2;
    font("Manrope", bold ? "bold" : "normal", size);
    color(ln.k === "group" ? [40, 60, 150] : INK);
    labelLines.forEach((t, i) => doc.text(t, x0, y + 1.7 + step * 0.75 + i * step));
    if (noteLines.length) {
      font("Manrope", "normal", 8);
      color(MUTED);
      noteLines.forEach((t, i) => doc.text(t, x0, y + 1.7 + labelLines.length * step + lh(8) * 0.75 + i * lh(8)));
    }
    if (ln.amt) {
      font("Manrope", "bold", ln.k === "total" ? 12 : 9.5);
      color(ln.neg ? NEG : INK);
      doc.text(ln.amt, M + CW - (ln.k === "row" ? 0 : 2), y + 1.7 + step * 0.75, { align: "right" });
    }
    y += h;
  }
  y += 4;

  // ---- 5. Cómo se calcula ----
  heading("Cómo se calcula");
  paragraph(m.how.intro);
  paragraph(m.how.check, { size: 9 });
  paragraph(m.how.billing, { style: "bold" });
  paragraph(m.how.billingNote);
  paragraph(m.how.estimate, { size: 8.5, c: MUTED });

  // ---- 6. Cierre ----
  y += 3;
  paragraph(m.disclaimer, { size: 9, c: MUTED });
  if (m.callWhen) paragraph(`Tu llamada con Fivo: ${m.callWhen}.`, { style: "bold", gap: 0 });

  // Pie de cada página
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    font("Manrope", "normal", 8);
    color(MUTED);
    doc.text("Fivo · Tu cálculo", M, H - 9);
    doc.text(`${p} / ${pages}`, M + CW, H - 9, { align: "right" });
  }

  return doc.output("blob");
}

/** Descarga directa del archivo (sin ventana de imprimir). En iOS, si el navegador no admite `download`, abre el PDF. */
export function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.rel = "noopener";
  document.body.appendChild(a);
  if ("download" in a) a.click();
  else window.location.assign(url);
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
