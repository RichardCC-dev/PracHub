# Plan de mejoras y correcciones — PracHub

> Documento de planificación. **En implementación en la rama `Refactor_2`.**
> La mayoría de items del plan ya fueron aplicados en este branch; se mantiene como referencia de las decisiones tomadas.

## 1. Contexto

Refactor integral (frontend React + backend Express/Sequelize + BD PostgreSQL + documentación de APIs) para:
corregir bugs de formato de datos, eliminar duplicados, introducir navegación unificada (sidebar + botón único de retroceso + logo→inicio + avatar→perfil), rediseñar el home público y las vistas principales de cada rol, y ajustar CV, ofertas, postulación, mensajería/notificaciones, empresas seguidas y admin.

- **Sin tests nuevos** (requisito explícito).
- **Base de datos limpia/vacía**: al arrancar, `sequelize.sync({ alter: false })` (en `server/src/server.js`) crea todas las tablas desde los modelos. Por tanto, cambios de esquema (p. ej. nueva columna `title`) se aplican **actualizando el modelo**; no se requiere migración manual mientras la BD esté vacía.
- Se actualizará **Swagger** (`server/src/docs/swagger.js` y JSDoc en rutas) y `AGENTS.md` cuando aplique.

## 2. Hallazgos clave (bugs confirmados durante la exploración)

1. **Formato de modalidad inconsistente** — Las ofertas se guardan en inglés (`remote` / `in_person` / `hybrid`, ver `Offer.js` y `CreateOfferPage.jsx`), pero el filtro del estudiante usa español (`remoto` / `presencial` / `híbrido`, ver `StudentOffersPage.jsx`). El filtro **nunca coincide** y la modalidad se muestra en inglés crudo (p. ej. en `ApplyModal.jsx`). → Necesita capa de normalización (guardar/enviar en inglés, mostrar en español).
2. **Detalle de oferta por ID es solo-empresa** — `GET /offers/:offerId` está detrás de `authorize('company')` (`offerRoutes.js`). Los estudiantes no pueden abrir una oferta por URL/ID. → Falta endpoint público + página de detalle.
3. **Guardar perfil de empresa falla (firma de servicio)** — En `client/src/services/api.js`, `updateCompanyProfile(payload)` y `uploadLogo(file)` leen el token internamente, pero `CompanyProfileForm.jsx` los llama como `updateCompanyProfile(token, payload)` y `uploadLogo(token, file)`. Se envía el **token (string) como body** → los cambios no persisten / error al guardar. Las bindings de visualización (`tradeName || legalName` para nombre, `industry` para sector) son correctas; la sensación de "la empresa se llama como el sector" proviene de que las ediciones nunca se guardan.
4. **Versiones de CV se crean automáticamente al exportar** — `resumePdfService.exportResumePdf` llama a `createVersion(...)`. No existe guardado manual ni columna `title` en `ResumeVersion`.
5. **Mensajería es "networking" abierto** — `messageService.searchUsers` permite a cualquiera (incl. estudiante↔estudiante) iniciar chats. Las notificaciones de mensaje (`message_received`) caen en la campana de notificaciones.
6. **"Empresas que sigo" mezclada en Configurar Alertas** — `AlertSettingsPage.jsx` tiene una nav secundaria con la pestaña "Empresas que sigo".
7. **Navegación inconsistente** — múltiples botones "Volver"/`ArrowLeft`→`/dashboard` y navs ad‑hoc dispersos por página (incluido el simulador).

## 3. Supuestos confirmados por el usuario

1. **Vista principal del estudiante**: dashboard estilo la imagen de referencia (Bumeran), solo con funcionalidades implementadas:
   - Columna izquierda: tarjeta de perfil + estado/acceso al CV.
   - Centro: buscador (“¿Qué prácticas buscas? Hay N esperándote”) + pestañas **Empleos / Empresas** + sección **“Recomendadas para ti”**.
   - Columna derecha: **“Mi actividad”** con métricas (postulaciones, mensajes, % CV) en cajas redondeadas y en negrita.
2. **Ofertas recomendadas (IA matching / similares)**: info básica **incluyendo el nombre de la empresa** (título, empresa, modalidad, ubicación, % match). **Sin** requisitos, funciones ni descripción larga.
3. **Guardar CV**: botón **“Guardar versión”** con **título** personalizado (crea entrada en historial). Exportar PDF **deja de** crear versión. El borrador **sigue autoguardándose** para no perder datos.
4. **Mensajería**: la empresa solo inicia chat con **candidatos que postularon** a sus ofertas; el **estudiante solo responde**; se elimina chat **estudiante↔estudiante**.
5. **Navegación**: **sidebar persistente** con las funcionalidades por rol + **logo→vista principal** + **botón único “Atrás”** en barra superior. El **avatar/imagen del usuario → su perfil**.

## 4. Arquitectura de la solución (componentes compartidos nuevos)

- `client/src/utils/format.js` — mapas y helpers de formato: `MODALITY_LABELS` (`remote→Remoto`, `in_person→Presencial`, `hybrid→Híbrido`), formateo de fechas y otros labels. Reutilizado en todas las vistas para garantizar el formato correcto front↔back↔BD.
- `client/src/components/ui/StatCard.jsx` — métrica con número en **negrita** dentro de caja **redondeada** (para dashboards y home).
- `client/src/components/layout/AppShell.jsx` — layout para vistas autenticadas: `Sidebar` + `TopBar` + área de contenido.
- `client/src/components/layout/Sidebar.jsx` — logo (→ `/dashboard`), navegación por rol (estudiante / empresa / admin) y footer con usuario/logout.
- `client/src/components/layout/TopBar.jsx` — **botón único “Atrás”** (`navigate(-1)` con fallback a `/dashboard`), **ícono de Mensajes con badge de no leídos**, `NotificationBell`, **avatar → perfil**.

## 5. Fases de trabajo

### Fase 1 — General / transversal
- **Formato de datos**: introducir `utils/format.js`; corregir filtro y visualización de modalidad; revisar fechas/labels en todas las vistas.
- **Navegación unificada**: envolver rutas protegidas en `App.jsx` con `AppShell`; eliminar navs y botones “Volver”/`ArrowLeft` ad‑hoc (StudentOffersPage, CVBuilderPage, CompanyProfilePage, CompanyCandidatesPage, CompanyFeedPage, AlertSettingsPage, simulador, etc.).
- **Home público**: nuevo `LandingPage` en `/` (hero + secciones de funcionalidades + métricas en cajas + CTAs). La pantalla actual de selección (login/registro estudiante/empresa) se mostrará al pulsar “Iniciar sesión” / “Crear cuenta”.
- **Métricas destacadas**: usar `StatCard` para todos los números importantes (negrita / caja redondeada).
- **Duplicados**: eliminar botones/endpoints/funcionalidades repetidas y estandarizar (p. ej. botón “Postular” duplicado, doble acceso a candidatos).

### Fase 2 — Estudiante
- **Vista principal** (rediseño de `WelcomePage` para estudiante): layout de 3 columnas según la imagen (perfil+CV / buscador+recomendadas con pestañas Empleos·Empresas / “Mi actividad” con métricas).
- **Recomendadas**: tarjetas con info básica **+ nombre de empresa** (sin requisitos/funciones/descripción larga).
- **Construir CV**:
  - Botón **“Guardar versión”** con campo **título** → nuevo `POST /resume/versions` (manual).
  - Añadir columna `title` al modelo `ResumeVersion` (creada por sync en BD vacía).
  - Quitar auto‑versión en export (`resumePdfService.exportResumePdf`).
  - Mostrar el **título** en `CVVersionHistory.jsx`.
  - **Panel emergente y dinámico** del **Historial de Análisis de CV** para ver/aplicar cambios en tiempo real.
- **Prácticas disponibles**:
  - **Página de detalle por ID/URL** (`/offers/:offerId`) con endpoint público.
  - **Filtros avanzados** (área, modalidad, carrera, compensación, etc.).
  - Cada oferta enlaza a su detalle.
- **Análisis de CV**:
  - Solo modo **por‑oferta** (quitar modo general de `CVAnalyzer.jsx`).
  - Botón de análisis **dentro del detalle de la oferta** (no en el listado ni en “Postular”).
  - Reporte exportado indica la **sección exacta** donde se sugieren cambios.
- **Postular ahora**:
  - El botón **aparece dentro del detalle** de la oferta.
  - `ApplyModal.jsx` **sin información duplicada** de la oferta.
  - **Eliminar carta de presentación** opcional.
- **Empresas que sigo**:
  - **Quitar la pestaña/vista “Empresas que sigo” de “Configurar Alertas”** (`AlertSettingsPage.jsx`); queda como funcionalidad propia desde el sidebar.
  - Corregir las llamadas de datos del **feed** (revisar `savedCompanyService.getFollowedCompaniesFeed` y store/página).
- **Mensajes y notificaciones**:
  - El estudiante **solo responde** (sin iniciar; sin buscador de usuarios).
  - **Eliminar chat estudiante↔estudiante**.
  - **Badge con número** de mensajes no leídos en el ícono de Mensajes.
  - **Notificaciones solo de empleos**: dejar de crear `message_received`; la campana muestra solo lo relacionado a empleos (cambios de estado de postulación, alertas de ofertas).

### Fase 3 — Empresa
- **Vista principal** (rediseño de `WelcomePage` para empresa): **métricas generales** (ofertas, pendientes, postulaciones, seguidores) en `StatCard` + **datos de la empresa**.
- **Perfil de empresa**:
  - **Corregir guardado** (ajustar llamadores a `updateCompanyProfile(payload)` y `uploadLogo(file)` en `CompanyProfileForm.jsx` / `CompanyProfilePage.jsx`).
  - Verificar visualización correcta (nombre = `tradeName || legalName`; sector = `industry`).
- **Unificar** “Gestionar mis ofertas” + “Ver candidatos” en una sola vista (lista de ofertas con sus postulantes), eliminando la duplicidad de accesos.

### Fase 4 — Admin
- Añadir pestaña **“Reportes”** con estado **“Próximamente”** (vacía) en `AdminDashboardPage.jsx`.

### Fase 5 — Backend / BD / Documentación
- **Ofertas**: endpoint público `GET /offers/:offerId` (detalle accesible a estudiantes); `getAllOffers` ya incluye `company`.
- **Resume/Versiones**: columna `title` en modelo; endpoint de guardado manual (`POST /resume/versions`); desacoplar versión del export.
- **Mensajes**: restringir inicio de conversación (empresa→candidatos que postularon); bloquear estudiante↔estudiante; el estudiante solo responde.
- **Notificaciones**: solo de empleos (no crear `message_received`).
- **Feed empresas seguidas**: revisar/corregir consulta y mapeo.
- **Swagger + `AGENTS.md`**: actualizar endpoints nuevos/cambiados.

## 6. Cambios por archivo (resumen)

**Frontend**
- `App.jsx` — integrar `AppShell`, ajustar rutas, ruta nueva `/offers/:offerId`.
- `pages/HomePage.jsx` → nuevo `LandingPage` + pantalla de selección reutilizada.
- `pages/WelcomePage.jsx` — dashboards de estudiante y empresa.
- `pages/StudentOffersPage.jsx` + nuevo `pages/OfferDetailPage.jsx` — filtros avanzados, detalle por ID, botón postular y análisis dentro del detalle.
- `components/ApplyModal.jsx` — sin info duplicada, sin carta de presentación.
- `components/CVAnalyzer.jsx` — solo por‑oferta, panel emergente, sección exacta en export.
- `pages/CVBuilderPage.jsx`, `components/CVExportPanel.jsx`, `components/CVVersionHistory.jsx`, `store/cvStore.js` — guardado manual con título.
- `pages/AlertSettingsPage.jsx` — quitar pestaña “Empresas que sigo”.
- `pages/FollowedCompaniesPage.jsx`, `pages/CompanyFeedPage.jsx`, `store/savedCompanyStore.js`, `services/savedCompanyApi.js` — feed correcto.
- `pages/InboxPage.jsx`, `store/messageStore.js`, `components/NotificationBell.jsx` — reply‑only, badge, notificaciones solo empleo.
- `pages/CompanyProfilePage.jsx`, `components/CompanyProfileForm.jsx`, `services/api.js` — fix guardado/logo.
- `pages/CompanyOffersPage.jsx` + `pages/CompanyCandidatesPage.jsx` — unificación.
- `pages/AdminDashboardPage.jsx` — pestaña Reportes (Próximamente).
- Nuevos: `utils/format.js`, `components/ui/StatCard.jsx`, `components/layout/{AppShell,Sidebar,TopBar}.jsx`.

**Backend**
- `routes/offerRoutes.js`, `controllers/offerController.js`, `services/offerService.js` — detalle público.
- `routes/resumeRoutes.js`, `controllers/resumeController.js`, `services/resumePdfService.js`, `services/resumeVersionService.js`, `models/ResumeVersion.js` — guardado manual + `title` + desacoplar export.
- `services/messageService.js`, `controllers/messageController.js`, `routes/messageRoutes.js` — reglas de inicio de conversación.
- `services/notificationService.js`, `controllers/messageController.js` — no crear notificaciones de mensaje.
- `services/savedCompanyService.js`, `controllers/savedCompanyController.js` — feed.
- `docs/swagger.js` + JSDoc en rutas — documentación.

## 7. Notas de base de datos
- BD vacía → `sequelize.sync({ alter: false })` crea todas las tablas desde los modelos al arrancar.
- Cambio de esquema necesario: **`title` (STRING, nullable) en `ResumeVersion`** → basta actualizar el modelo.
- (Opcional) añadir archivo de migración equivalente para mantener el patrón de `server/src/migrations`, aunque la app en ejecución usa `sync`.

## 8. Verificación (sin tests nuevos)
- Lint/build: `cd server && npm run lint`; `cd client && npm run lint && npm run build`.
- Arranque limpio del backend contra la BD vacía (verificar creación de tablas).
- Pruebas manuales por flujo:
  - Landing pública + acceso login/registro.
  - Dashboard por rol con sidebar, botón único Atrás, logo→inicio, avatar→perfil.
  - Empresa: guardar perfil (persistencia OK), subir logo, métricas, ofertas+candidatos unificados.
  - Estudiante: recomendadas (con empresa, info básica), detalle de oferta por URL, filtros avanzados, postular desde detalle (sin carta), análisis por‑oferta + export con secciones.
  - CV: guardar versión con título, export sin crear versión, panel de historial de análisis.
  - Empresas seguidas: feed correcto; alertas sin la vista de seguidas.
  - Mensajería: estudiante solo responde; sin chat estudiante↔estudiante; badge de no leídos; notificaciones solo de empleo.
  - Admin: pestaña Reportes (Próximamente).

## 9. Riesgos / consideraciones
- Refactor de navegación amplio (muchas páginas) → se hará incremental para no romper rutas.
- Unificar ofertas/candidatos y rediseñar dashboards toca bastante UI; se conserva la lógica de datos existente.
- La restricción de mensajería (empresa→solo candidatos) requiere validar relación postulante↔oferta en backend.
- Con BD poblada en el futuro, añadir columnas requeriría `alter:true` o migración (hoy no aplica por BD vacía).
