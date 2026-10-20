# Eli-Styles · Agenda 💗

Agenda de citas para el local, pensada para usarse desde el iPhone como una app.
Tema rosa, funciona sin internet y guarda todo en el propio teléfono.

## Qué hace

- **Hoy**: saludo, resumen del día (citas, pendientes, cobrado) y la agenda de hoy ordenada por hora.
- **Calendario**: vista mensual con puntos de color por día y el detalle del día elegido.
- **Servicios**: los tipos de trabajo del local (nombre, duración, precio y color). Se eligen al agendar.
- **Clientes**: ficha con nombre, teléfono/WhatsApp, email y notas, más historial de visitas.
- **Ajustes**: nombre del local, horario de atención, intervalo de horas, moneda y copias de seguridad.
- **Nueva cita**: cliente (o alta rápida), trabajo, fecha, hora disponible (no permite solapes), estado y notas.

Estados de cita: pendiente, confirmada, completada y cancelada.

## Para la dueña del local

La app la usa la dueña: ella crea los clientes, define sus trabajos y agenda las citas.
Los datos del cliente que se guardan son: **nombre y apellidos, teléfono (WhatsApp), email y notas**
(alergias, preferencias, cómo llegó, etc.).

## Desarrollo

```bash
npm install     # una sola vez
npm run dev     # servidor local para probar en el ordenador
npm run build   # genera la carpeta dist/ lista para publicar
npm run icons   # regenera los iconos (necesita rsvg-convert)
npm run smoke   # pruebas rápidas de render y de la lógica de horarios
```

## Publicar e instalar en el iPhone

La app es una **PWA**: se sube como web y se instala en el iPhone sin pasar por la App Store.

1. Ejecuta `npm run build` y publica la carpeta `dist/` en cualquier hosting con **HTTPS**
   (Netlify, Vercel, Cloudflare Pages, GitHub Pages…). Arrastrar la carpeta en
   <https://app.netlify.com/drop> es lo más rápido).
2. Abre la dirección en **Safari** del iPhone.
3. Toca **Compartir → Añadir a pantalla de inicio**.
4. Aparecerá el icono rosa con el corazón; se abre a pantalla completa como cualquier app.

> El service worker (modo sin conexión) solo se activa con HTTPS.

Para probar desde el iPhone en la misma red Wi-Fi sin publicar:

```bash
npm run build
npm run preview -- --host
```

## Datos y copias de seguridad

- Todo se guarda en el navegador del teléfono (`localStorage`), sin cuentas ni servidores.
- En **Ajustes → Copia de seguridad** puedes **exportar** un archivo `.json` y **importarlo**
  después. Conviene exportar una copia de vez en cuando: si se borran los datos del navegador
  o se cambia de teléfono, la copia es la única forma de recuperarlos.
- **Borrar todos los datos** deja la app como recién instalada.

## Estructura

```
src/
  App.tsx                 pestañas, cabecera y barra inferior
  store.tsx               estado global y guardado en localStorage
  types.ts                tipos (cita, cliente, trabajo, ajustes)
  lib/
    date.ts               fechas, horas y formato en español
    schedule.ts           horas disponibles y detección de solapes
    db.ts                 carga/guardado y datos de ejemplo
  components/             hojas, formularios, filas de cita, iconos
  pages/                  Hoy, Calendario, Servicios, Clientes, Ajustes
  styles.css              tema rosa (móvil primero, con notch/safe-area)
public/
  manifest.webmanifest    configuración PWA
  sw.js                   service worker (uso sin conexión)
  icons/                  iconos generados
```

Los trabajos de ejemplo (Corte, Peinado, Coloración, Manicure, Tratamiento) se pueden
editar o borrar desde la pestaña **Servicios**.
