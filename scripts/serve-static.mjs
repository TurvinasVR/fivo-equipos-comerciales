// Servidor estático mínimo para probar una carpeta exportada como lo haría un alojamiento Apache:
// sin reescritura de extensiones; un directorio sin barra final redirige a "carpeta/" y sirve index.html;
// lo que no existe devuelve 404.html con estado 404.
// Uso: node scripts/serve-static.mjs out 4301 (o npm run serve:static)
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const root = process.argv[2];
const port = Number(process.argv[3] || 4300);
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif",
  ".woff2": "font/woff2", ".woff": "font/woff", ".mp4": "video/mp4", ".vtt": "text/vtt", ".ico": "image/x-icon", ".txt": "text/plain",
};

createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  const path = normalize(decodeURIComponent(url.pathname)).split("..").join("");
  let file = join(root, path);
  if (existsSync(file) && statSync(file).isDirectory()) {
    if (!url.pathname.endsWith("/")) {
      res.writeHead(301, { Location: url.pathname + "/" + url.search });
      return res.end();
    }
    file = join(file, "index.html");
  }
  if (!existsSync(file)) {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(existsSync(join(root, "404.html")) ? readFileSync(join(root, "404.html")) : "404");
  }
  const size = statSync(file).size;
  res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream", "Content-Length": size, "Accept-Ranges": "bytes" });
  res.end(readFileSync(file));
}).listen(port, () => console.log(`sirviendo ${root} en http://localhost:${port}`));
