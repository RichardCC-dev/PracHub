# PracHub — Datos de demostración (seed)

> Generado automáticamente por `server/scripts/seedFullDemo.js` el 2026-06-25T13:00:54.879Z.

**Contraseña común para TODOS los usuarios:** `Demo1234!`

---

## 1. Administrador

| Rol | Email | Password | userId |
|-----|-------|----------|--------|
| admin | admin.demo@prachub.local | Demo1234! | 5 |

## 2. Empresas

| Email | Razón social | Estado verif. | Puede publicar | userId | companyId |
|-------|--------------|---------------|----------------|--------|-----------|
| empresa.verificada@prachub.local | TechNova Solutions SAC | verified | Sí | 6 | 2 |
| empresa.datos@prachub.local | DataPeru Analytics EIRL | verified | Sí | 7 | 3 |
| empresa.pendiente@prachub.local | StartUp Naciente SAC | pending | No | 8 | 4 |

## 3. Estudiantes

| Email | Nombre | Carrera | userId | studentId | resumeId |
|-------|--------|---------|--------|-----------|----------|
| estudiante.dev@prachub.local | Juan Pérez | Ingeniería de Software | 9 | 3 | 3 |
| estudiante.data@prachub.local | Ana Torres | Ciencias de la Computación | 10 | 4 | 4 |
| estudiante.design@prachub.local | Diego Ramírez | Diseño UX/UI | 11 | 5 | 5 |

## 4. Ofertas

| offerId | Título | Empresa (companyId) | Estado | Modalidad |
|---------|--------|---------------------|--------|-----------|
| 2 | Practicante Desarrollo Web Fullstack (React/Node.js) | 2 | approved | remote |
| 3 | Practicante de Ciencia de Datos e IA | 3 | approved | hybrid |
| 4 | Practicante Diseño UX/UI | 2 | approved | remote |
| 5 | Practicante Backend Python (pendiente moderación) | 3 | pending | in_person |
| 6 | Practicante QA (rechazada) | 2 | rejected | remote |

## 5. Postulaciones

| applicationId | studentId | offerId | Estado |
|---------------|-----------|---------|--------|
| 2 | 3 | 2 | enviada |
| 3 | 4 | 3 | revision |
| 4 | 5 | 4 | aceptada |
| 5 | 4 | 2 | descartada |

## 6. Otros datos creados

- **Empresas seguidas (SavedCompany):** relaciones estudiante↔empresa para probar el feed de empresas seguidas.
- **Notificaciones:** ejemplos de cada tipo relevante (offer_match, status_change, application_received, offer_rejected, followed_company_offer).
- **Mensajes directos:** hilo empresa↔estudiante (HU-24/25).
- **Invitación a postular (InvitationToApply):** en estado PENDING para probar aceptar/declinar.
- **Análisis de CV (CVAnalysis):** ejemplo con score y keywords para el estudiante Juan.
- **Simulación de entrevista (Simulation):** ejemplo completado para la estudiante Ana.
- **AlertSettings:** configuradas para cada estudiante.
- **ResumeVersion:** una versión guardada por estudiante.

## 7. Qué probar por tipo de usuario

### Admin
- Verificar/rechazar la empresa **StartUp Naciente** (pending).
- Aprobar la oferta **Practicante Backend Python** (pending) y revisar la rechazada de QA.
- Revisar dashboard de reportes/métricas.

### Empresa
- Iniciar sesión con `empresa.verificada@prachub.local` y gestionar ofertas/candidatos.
- Revisar postulaciones recibidas y cambiar su estado.
- Enviar mensajes/invitaciones a candidatos.
- Con `empresa.pendiente@prachub.local` comprobar que NO puede publicar ofertas.

### Estudiante
- Iniciar sesión con `estudiante.dev@prachub.local` y ver recomendaciones/ofertas.
- Postular a ofertas, ver estado de postulaciones y notificaciones.
- Seguir empresas y revisar el feed.
- Responder la invitación a postular (aceptar/declinar).
- Editar el CV y guardar versiones.

## 8. Acciones NO automatizadas (hacer manualmente en el sistema)

- Registro de nuevos usuarios vía formulario + verificación de email por token.
- Recuperación de contraseña vía correo.
- Export/descarga real del CV en PDF (Puppeteer en runtime).
- Análisis de CV y simulación de entrevista con IA en vivo (Gemini): los registros sembrados son ejemplos estáticos.
- Subida de logo de empresa / foto de perfil (archivos reales).
