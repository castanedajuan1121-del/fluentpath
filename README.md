# FluentPath 🇺🇸

Academia autónoma de **inglés americano con IA (Gemini)**: ruta CEFR hasta diciembre de 2027, calendario de tareas obligatorias, laboratorio de pronunciación con corrección palabra por palabra, conversación con tutor IA, películas y YouTube, vocabulario con repetición espaciada, gramática, escritura, traducción y evaluaciones periódicas.

## 🔒 Acceso privado

La web publicada está **cifrada (AES-256-GCM + PBKDF2, 600.000 iteraciones)** con tu usuario y clave. Sin las credenciales correctas nadie puede ver la app ni la API key, aunque mire el código fuente de la página.

Nada sensible vive en este repositorio. Todo se guarda como **secretos de GitHub** (Settings → Secrets and variables → Actions):

| Secreto | Qué es |
|---|---|
| `APP_USER` | Tu usuario para entrar |
| `APP_PASSWORD` | Tu clave (mínimo 10 caracteres; usa una larga y única) |
| `GEMINI_KEY` | Tu API key de Gemini (AI Studio `AIza…` o Vertex `AQ.…`) |
| `SYNC_TOKEN` | Token de GitHub (fine-grained) con **Contents: Read and write** solo sobre este repo. Sincroniza tu progreso entre dispositivos |

## Cambiar usuario, clave o API key

1. Settings → Secrets and variables → Actions → edita el secreto.
2. Actions → **Publicar FluentPath** → **Run workflow**.

En 1–2 minutos la web queda actualizada y la sesión anterior se cierra en todos los dispositivos.

## Estructura

- `src/app.html` — la app completa (un solo archivo).
- `build/login.html` — pantalla de acceso.
- `build/build.mjs` — inyecta la key y cifra la app.
- `.github/workflows/deploy.yml` — publica en GitHub Pages en cada push.

## ☁️ Sincronización

Tu progreso se cifra con tu clave (AES-256-GCM) y se guarda en la rama `progress` de este repo (`progress.enc.json`). GitHub solo ve datos cifrados. Se sincroniza al hacer cambios, al volver a la app y cada 3 minutos; los cambios hechos en dos dispositivos a la vez se combinan sin perder nada.
