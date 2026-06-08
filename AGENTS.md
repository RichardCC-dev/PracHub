# PracHub — Guía para agentes de IA

Referencia rápida sobre la estructura del proyecto, comandos de desarrollo y convenciones clave.

---

## Estructura del proyecto

```
PracHub/
├── client/          # React 18 + Vite + TailwindCSS (SPA)
├── server/          # Express + Sequelize + PostgreSQL (REST API)
├── .github/
│   └── workflows/   # CI/CD (ci.yml — lint + tests en cada PR)
└── AGENTS.md        # Este archivo
```

---

## Comandos útiles

### Backend (`server/`)

```bash
npm install          # instalar dependencias
npm start            # producción (node src/server.js)
npm run dev          # desarrollo (nodemon)
npm test             # Jest + supertest (26 tests)
npm run lint         # ESLint
```

### Frontend (`client/`)

```bash
npm install          # instalar dependencias
npm run dev          # Vite dev server (http://localhost:5173)
npm run build        # build de producción → dist/
npm test             # Vitest (18 tests)
npm run lint         # ESLint
```

---

## Variables de entorno

Cada subcarpeta tiene un `.env.example`. Copiar y completar antes de levantar:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Variables críticas del servidor:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión PostgreSQL |
| `JWT_SECRET` | Secret para firmar tokens (mín. 32 chars) |
| `GEMINI_API_KEY` | API key de Google Gemini |
| `EMAIL_*` | Configuración SMTP para emails transaccionales |
| `NODE_ENV` | `development` / `production` |

---

## Arquitectura del backend

```
server/src/
├── config/
│   ├── geminiClient.js   # Cliente Gemini singleton + constantes GEMINI_MODELS
│   └── database.js       # Instancia Sequelize
├── controllers/          # Lógica de negocio por dominio
├── middlewares/
│   ├── authMiddleware.js  # Verificación JWT
│   ├── authorize.js       # RBAC genérico: authorize('admin'|'company'|'student')
│   ├── rateLimit.js       # Rate limiting (desactivado fuera de producción)
│   └── validateRequest.js # Sanitización express-validator
├── models/               # Modelos Sequelize
├── routes/               # Definición de rutas Express
├── services/             # Servicios de IA y lógica de dominio
└── utils/
    └── logger.js         # Winston (nivel info en prod, debug en dev)
```

### Convenciones de middlewares

- **`authorize(role)`** — siempre usar este en lugar de middlewares de rol individuales.
- **`authMiddleware`** → **`authorize(role)`** → validaciones → controller.
- Los modelos de Gemini se referencian vía `GEMINI_MODELS` (importar de `config/geminiClient.js`).

---

## Arquitectura del frontend

```
client/src/
├── components/
│   ├── routing/           # Guards de ruta: PrivateRoute, CompanyRoute, AdminRoute, StudentRoute
│   │   └── LoadingSpinner.jsx
│   └── ErrorBoundary.jsx
├── hooks/                 # TanStack Query hooks (useApplications, useOffers, useSimulations…)
├── pages/                 # Páginas lazy-loaded
├── services/
│   ├── apiBase.js         # API_URL, getToken, authHeaders, parseResponse (compartido)
│   ├── api.js             # Servicios principales (simulaciones, CV…)
│   ├── offerApi.js        # Servicios de ofertas (token explícito)
│   ├── applicationApi.js  # Servicios de postulaciones
│   ├── notificationApi.js
│   ├── alertApi.js
│   ├── savedCompanyApi.js
│   └── recommendationApi.js
└── store/
    └── authStore.js       # Zustand — estado de autenticación global
```

### Convenciones del frontend

- **Route guards**: usar siempre los de `components/routing/`. No crear guards inline en `App.jsx`.
- **Servicios**: importar `API_URL`, `getToken`, `authHeaders` y `parseResponse` desde `services/apiBase.js`.
- **Hooks TanStack Query**: las `queryFn` NO deben recibir el token como argumento; las funciones de `api.js` leen el token internamente vía `getToken()`.
- **`App.jsx`**: solo debe contener el árbol de rutas y las importaciones lazy. Sin componentes de UI ni lógica inline.

---

## Tests

### Backend — Jest + supertest

```bash
cd server && npm test
```

- 26 tests en `server/src/tests/`
- Configura `NODE_ENV=test` automáticamente (las rutas de test están habilitadas solo en test)

### Frontend — Vitest + Testing Library

```bash
cd client && npm test
```

- 18 tests en `client/src/tests/`
- `ErrorBoundary.test.jsx`, `LoginForm.test.jsx`, `PrivateRoute.test.jsx`
- `PrivateRoute.test.jsx` importa desde `components/routing/PrivateRoute`

### CI/CD

GitHub Actions corre en cada PR: lint → test backend → test frontend (`ci.yml`).

---

## Rate limiting

Configurado en `server/src/middlewares/rateLimit.js`:

- **Producción**: límites activos (configurable vía env vars).
- **Desarrollo / test**: desactivado automáticamente para no bloquear pruebas locales con múltiples usuarios.
