// Construye la web protegida: inyecta la API key y cifra toda la app con usuario + clave.
// Uso (GitHub Actions lo ejecuta solo): APP_USER=... APP_PASSWORD=... GEMINI_KEY=... node build/build.mjs
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { webcrypto as crypto } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const user = (process.env.APP_USER || "").trim().toLowerCase();
const pass = process.env.APP_PASSWORD || "";
const key = (process.env.GEMINI_KEY || "").trim();
const ITER = 600000;

const fail = (m) => { console.error("\n❌ " + m + "\n"); process.exit(1); };
if (!user) fail("Falta el secreto APP_USER (Settings → Secrets and variables → Actions).");
if (!pass) fail("Falta el secreto APP_PASSWORD (Settings → Secrets and variables → Actions).");
if (pass.length < 10) fail("APP_PASSWORD debe tener al menos 10 caracteres.");
if (!key) console.warn("⚠️  Sin GEMINI_KEY: la app pedirá la key en Ajustes.");
if (/["\\<\n]/.test(key)) fail("GEMINI_KEY tiene caracteres inválidos.");

const syncToken = (process.env.SYNC_TOKEN || "").trim();
const syncRepo = (process.env.SYNC_REPO || "").trim();
if (/[^\w-]/.test(syncToken)) fail("SYNC_TOKEN tiene caracteres inválidos.");
if (!syncToken) console.warn("⚠️  Sin SYNC_TOKEN: el progreso no se sincronizará entre dispositivos.");
const app = readFileSync(join(root, "src/app.html"), "utf8")
  .split("%%GEMINI_KEY%%").join(key)
  .split("%%SYNC_TOKEN%%").join(syncToken)
  .split("%%SYNC_REPO%%").join(syncToken ? syncRepo : "");
if (key && !app.includes(key)) fail("No se pudo inyectar la key.");

const enc = new TextEncoder();
const b64 = (buf) => Buffer.from(buf).toString("base64");
const salt = new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode("fluentpath-v1:" + user))).slice(0, 16);
const base = await crypto.subtle.importKey("raw", enc.encode(pass), "PBKDF2", false, ["deriveKey"]);
const aes = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
const iv = crypto.getRandomValues(new Uint8Array(12));
const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aes, enc.encode(app));

const payload = JSON.stringify({ iv: b64(iv), ct: b64(ct), iter: ITER });
const login = readFileSync(join(root, "build/login.html"), "utf8");
if (!login.includes("__PAYLOAD__")) fail("Plantilla de login inválida.");

const out = join(root, "dist");
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "index.html"), login.replace("__PAYLOAD__", () => payload));
for (const f of ["manifest.webmanifest", "icon.svg"]) copyFileSync(join(root, "build", f), join(out, f));
writeFileSync(join(out, ".nojekyll"), "");
console.log(`✅ Web cifrada lista en dist/ (${(payload.length / 1024).toFixed(0)} KB) · usuario: ${user}`);
