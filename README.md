# NOTAS MDA — PJUD5 Consola de Turno

Web creada para facilitar y optimizar el trabajo realizado en mesa de ayuda.

## Características

- Biblioteca de plantillas de comentarios con copiado en 1 clic.
- Modales con formularios para datos variables (teléfono, fecha, equipo, correo).
- Soluciones con/sin verificación con 11 procedimientos tipo.
- Guía de derivaciones, accesos directos y tabla de proxies.
- 10 temas (6 oscuros, 4 claros) con persistencia en `localStorage`.
- PIN de acceso (`pjud5upg`).

## Técnico

- Sin frameworks: HTML + CSS (variables por tema) + JS vanilla.
- Modales con `<dialog>` nativo, acordeón con `<details>`.
- Fuentes: Archivo Black (display), Inter (texto), JetBrains Mono (datos).
- Servir estático: `npx serve .` o abrir `index.html` vía HTTP local.
