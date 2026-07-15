# Despliegue gratuito de PracHub

Guía para publicar PracHub como una aplicación separada en:

- **Backend y base de datos MySQL:** Railway.
- **Frontend React/Vite:** Vercel.

> **Importante sobre el costo:** Railway ofrece actualmente un crédito inicial de prueba de USD 5 por hasta 30 días. Después, el plan Free aplica un crédito mensual limitado y los volúmenes persistentes de cuentas de prueba pueden eliminarse al terminar el periodo de prueba. Por tanto, esta arquitectura sirve para una demo académica o pruebas, pero no debe considerarse almacenamiento gratuito permanente sin revisar los límites vigentes. Consulta la [documentación oficial del trial de Railway](https://docs.railway.com/pricing/free-trial) antes de crear la base de datos.

## 1. Arquitectura final

```text
Navegador
   |
   | HTTPS
   v
Vercel: client/ (React + Vite)
   |
   | VITE_API_URL=https://<backend>.up.railway.app/api
   v
Railway: server/ (Node + Express)
   |
   +--> Railway MySQL
   +--> Google Gemini API
   +--> SMTP para correos transaccionales
```

El backend escucha el puerto que Railway entrega en `PORT`, expone el chequeo `GET /health` y publica la API bajo `/api`.

## 2. Requisitos previos

1. Repositorio de PracHub disponible en GitHub.
2. Cuenta de [Railway](https://railway.com/).
3. Cuenta de [Vercel](https://vercel.com/).
4. Una clave de Google Gemini para las funciones de análisis de CV y simulación.
5. Un proveedor SMTP para producción. Puede ser el proveedor de correo institucional, un servicio con plan gratuito o una cuenta de pruebas para una demo.
6. Node.js 20.19.0 o superior para validar localmente. El pipeline de CI usa Node.js 20.19.0.

Antes de publicar, comprobar localmente:

```bash
cd server
npm ci
npm test
npm run lint

cd ../client
npm ci
npm test
npm run build
```

En PowerShell, la copia de las plantillas de variables puede hacerse así:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

Nunca se deben subir `server/.env` ni `client/.env` al repositorio.

## 3. Variables de entorno

### 3.1 Backend en Railway

Configurar estas variables en el servicio Node de Railway. Los valores de ejemplo son solo para explicar el formato; deben reemplazarse por valores reales.

| Variable | Valor para producción | Requerida | Notas |
|---|---|---:|---|
| `NODE_ENV` | `production` | Sí | Activa HSTS y los límites de producción. |
| `PORT` | No fijar manualmente | Sí | Railway la inyecta automáticamente. El código usa `4000` solo como fallback local. |
| `CLIENT_URL` | `https://<frontend>.vercel.app` | Sí | Origen permitido por CORS. Sin `/` final. |
| `FRONTEND_URL` | `https://<frontend>.vercel.app` | Sí | URL usada en enlaces de notificaciones y correos. |
| `APP_URL` | `https://<frontend>.vercel.app` | Sí | URL base de enlaces enviados por email. |
| `API_URL` | `https://<backend>.up.railway.app` | Sí | URL pública del backend, sin `/api`. |
| `ENABLE_SWAGGER` | `false` | No | Swagger queda deshabilitado en producción salvo que se establezca explícitamente en `true`. |
| `UPLOAD_PROVIDER` | `cloudinary` | Sí | En producción se requiere Cloudinary para conservar logos. |
| `CLOUDINARY_CLOUD_NAME` | Nombre del cloud | Sí para uploads | Credencial de Cloudinary. |
| `CLOUDINARY_API_KEY` | API key | Sí para uploads | Credencial de Cloudinary. |
| `CLOUDINARY_API_SECRET` | API secret | Sí para uploads | Credencial secreta de Cloudinary. |
| `JWT_SECRET` | Cadena aleatoria de 32+ caracteres | Sí | No reutilizar el valor de desarrollo. |
| `DB_HOST` | Host interno de MySQL | Sí | Usar la referencia interna de Railway, no `localhost`. |
| `DB_PORT` | Puerto interno de MySQL | Sí | Normalmente el valor entregado por el servicio MySQL. |
| `DB_NAME` | Nombre entregado por MySQL | Sí | Debe coincidir con la base creada. |
| `DB_USER` | Usuario entregado por MySQL | Sí | No usar necesariamente `root`. |
| `DB_PASSWORD` | Contraseña entregada por MySQL | Sí | El nombre correcto en el código es `DB_PASSWORD`, no `DB_PASS`. |
| `GEMINI_API_KEY` | Clave de Google Gemini | Para IA | Mantenerla solo en Railway; nunca usarla como variable `VITE_`. |
| `SMTP_HOST` | Host SMTP | Para emails | En producción el servicio de correo debe estar configurado. |
| `SMTP_PORT` | `587` o `465` | Para emails | Depende del proveedor. |
| `SMTP_SECURE` | `false` para 587, `true` para 465 | Para emails | Debe ser texto `true` o `false`. |
| `SMTP_USER` | Usuario SMTP | Para emails | |
| `SMTP_PASS` | Contraseña SMTP | Para emails | Usar un app password cuando el proveedor lo requiera. |
| `SMTP_FROM` | Remitente verificado | Para emails | Ejemplo: `PracHub <noreply@dominio.com>`. |
| `ADMIN_ACCESS_SECRET` | Cadena aleatoria | Sí para admin | Debe coincidir con `VITE_ADMIN_PORTAL_KEY`. |
| `ADMIN_ALERT_EMAIL` | Email del administrador | Recomendado | Destinatario de alertas administrativas. |
| `ADMIN_SEED_EMAIL` | Email inicial | Opcional | Usado por `scripts/createAdmin.js`. |
| `ADMIN_SEED_PASSWORD` | Contraseña inicial | Opcional | No dejar una contraseña de ejemplo en producción. |
| `LOG_LEVEL` | `info` | Recomendado | Usar `warn` o `error` si se desea menos ruido. |
| `SEED_COMPANY_PASSWORD` | Contraseña temporal | Solo seed | La usa `scripts/seedOffers.js` si se crea la empresa de prueba. |

Para generar secretos localmente sin inventarlos:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

La plantilla versionada se encuentra en [`server/.env.example`](../server/.env.example).

### 3.2 Frontend en Vercel

Configurar estas variables en Vercel para los entornos **Preview** y **Production**:

| Variable | Valor |
|---|---|
| `VITE_API_URL` | `https://<backend>.up.railway.app/api` |
| `VITE_ADMIN_PORTAL_KEY` | El mismo valor de `ADMIN_ACCESS_SECRET` |

`VITE_*` se incorpora al bundle del navegador. `VITE_ADMIN_PORTAL_KEY` no es un secreto fuerte: sirve como primera barrera del portal, pero la autorización real debe seguir dependiendo del JWT y del backend.

La plantilla está en [`client/.env.example`](../client/.env.example).

## 4. Crear la base de datos MySQL en Railway

1. Crear un proyecto nuevo en Railway.
2. Agregar un servicio **MySQL** desde el catálogo o template disponible en la cuenta.
3. Esperar a que el servicio termine de inicializarse.
4. En la pestaña de variables del servicio MySQL, identificar los valores equivalentes a:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLDATABASE`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
5. En el servicio del backend, copiar esos valores a `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASSWORD`. Railway permite referenciar variables de otro servicio; si se usa esa opción, verificar que la sintaxis generada por el panel corresponda al nombre real del servicio.
6. No conectar el backend a `127.0.0.1` o `localhost`: dentro de Railway, el host debe ser el host interno del servicio MySQL.

### Persistencia de datos

La base de datos necesita un volumen persistente. En una cuenta de prueba de Railway, comprobar las reglas de retención antes de guardar datos importantes. Para una demo, hacer exportaciones periódicas de MySQL; para producción real, usar un plan con persistencia y backups.

## 5. Desplegar el backend en Railway

El repositorio es un monorepo, por lo que el servicio debe apuntar a `server/`.

1. En el proyecto de Railway, agregar un servicio desde el repositorio GitHub.
2. En la configuración del servicio, establecer **Root Directory** en `server`. Railway documenta esta configuración para monorepos en [Deploying a monorepo](https://docs.railway.com/deployments/monorepo).
3. Configurar los comandos:
   - **Build Command:** `npm ci`
   - **Start Command:** `npm start`
4. Agregar las variables de la sección 3.1.
5. Generar un dominio público desde **Networking > Generate Domain**.
6. Copiar el dominio generado, por ejemplo `https://prachub-api-production.up.railway.app`, y usarlo como `API_URL`.
7. Verificar los logs hasta ver el mensaje de servidor escuchando.
8. Probar el health check:

```bash
curl https://<backend>.up.railway.app/health
```

Respuesta esperada:

```json
{"status":"ok","service":"prachub-api"}
```

Railway inyecta `PORT`; no se debe cambiar el código para usar un puerto fijo. El backend ya utiliza `process.env.PORT`.

### Inicialización del esquema

Al arrancar, `server/src/server.js` ejecuta:

```js
sequelize.sync({ alter: false })
```

En una base MySQL nueva esto crea las tablas que no existen. El arranque **no ejecuta automáticamente los archivos de `src/migrations/`** y no modifica tablas existentes. Para cambios de esquema posteriores, preparar una migración controlada y un backup antes de aplicarla.

No ejecutar `npm run sync-db` en producción sin revisar el impacto: ese script usa `alter: true` y puede modificar el esquema de forma no deseada.

### Crear el administrador inicial

Después de que el backend y la base estén disponibles, abrir la shell del servicio Railway y ejecutar desde el directorio raíz del servicio (`server/`):

```bash
node scripts/createAdmin.js
```

También se puede proporcionar email y contraseña directamente:

```bash
node scripts/createAdmin.js admin@dominio.com "UnaContraseñaLargaYUnica"
```

### Cargar ofertas de demostración (opcional)

Solo para un entorno de demo, configurar temporalmente `SEED_COMPANY_PASSWORD` y ejecutar:

```bash
node scripts/seedOffers.js
```

El script crea cinco ofertas aprobadas si no existe ninguna empresa. Ejecutarlo una sola vez para evitar duplicados de ofertas.

## 6. Desplegar el frontend en Vercel

1. Importar el mismo repositorio GitHub en Vercel.
2. Establecer **Root Directory** en `client`.
3. Seleccionar Vite si Vercel no lo detecta automáticamente.
4. Usar estos valores:
   - **Install Command:** `npm ci`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Agregar `VITE_API_URL` y `VITE_ADMIN_PORTAL_KEY` para Preview y Production.
6. Desplegar.
7. Copiar el dominio asignado por Vercel y actualizar en Railway:
   - `CLIENT_URL`
   - `FRONTEND_URL`
   - `APP_URL`
8. Reiniciar o redeployar el backend después de cambiar las variables.

La guía oficial de Vercel para Vite está en [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite).

### React Router y deep links

PracHub es una SPA con rutas como `/offers`, `/cv-builder` y `/admin`. Para que una recarga directa no devuelva 404, Vercel recomienda un rewrite hacia `index.html`. Crear `client/vercel.json` con:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Después, hacer commit y redeployar el frontend. Esta configuración es la recomendada por la documentación oficial de Vercel para SPAs Vite.

## 7. Archivos subidos con Cloudinary

En producción, `UPLOAD_PROVIDER=cloudinary` es obligatorio. El endpoint de logos envía archivos permitidos de hasta 2 MB al directorio `prachub/logos` de Cloudinary y guarda la URL HTTPS resultante en `Company.logoUrl`.

1. Crear una cuenta y un producto de programación en Cloudinary.
2. Copiar `Cloud name`, `API Key` y `API Secret` desde el panel del producto.
3. Configurarlos en Railway como `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET`.
4. Establecer `UPLOAD_PROVIDER=cloudinary`.
5. Subir un logo desde el perfil de una empresa y comprobar que la URL devuelta usa el dominio de Cloudinary.

El proveedor local continúa disponible solo para desarrollo y pruebas mediante `UPLOAD_PROVIDER=local`; sus archivos se escriben en `server/public/uploads/logos` y se sirven por `/uploads`. No se debe usar en Railway porque el filesystem no es persistente.

## 8. Verificación posterior al despliegue

### Backend

- [ ] `GET https://<backend>.up.railway.app/health` devuelve `200`.
- [ ] Los logs no muestran errores de autenticación de MySQL.
- [ ] `NODE_ENV=production` está configurado.
- [ ] `CLIENT_URL` coincide exactamente con el dominio de Vercel.
- [ ] `API_URL` no termina en `/api` y no contiene `localhost`.
- [ ] `GEMINI_API_KEY` está configurada si se probarán funciones de IA.
- [ ] SMTP está configurado antes de probar verificación de email, recuperación de contraseña o notificaciones.
- [ ] `/api-docs` devuelve 404 en producción, salvo que se haya habilitado intencionalmente `ENABLE_SWAGGER=true`.

### Frontend

- [ ] `VITE_API_URL` termina en `/api` y no tiene una doble barra.
- [ ] La landing page carga en el dominio de Vercel.
- [ ] Una recarga directa de `/login/student`, `/offers` y `/admin` no devuelve 404.
- [ ] El navegador no muestra errores de CORS.
- [ ] Registro e inicio de sesión funcionan.
- [ ] El dashboard carga datos desde el backend.
- [ ] El flujo de postulación funciona.
- [ ] El logo se puede subir y devuelve una URL HTTPS de Cloudinary.

### Integración

- [ ] Crear una cuenta de estudiante.
- [ ] Crear o habilitar una cuenta de empresa.
- [ ] Crear una oferta y revisar su moderación desde el administrador.
- [ ] Probar una postulación y el cambio de estado.
- [ ] Probar un mensaje entre empresa y candidato.
- [ ] Probar una función de Gemini.
- [ ] Revisar que los emails contengan enlaces al dominio de Vercel, no a `localhost`.

## 9. Solución de problemas

### Error de CORS

Actualizar `CLIENT_URL` en Railway con el dominio exacto de Vercel, sin barra final. Reiniciar el servicio. No usar `*` porque el backend trabaja con `credentials: true`.

### Error de conexión a MySQL

Verificar que:

1. `DB_HOST` no sea `localhost`.
2. `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASSWORD` provengan del servicio MySQL correcto.
3. El backend y MySQL estén en el mismo proyecto o tengan conectividad permitida.
4. No se haya usado `DB_PASS`, que no es el nombre que consume `database.js`.

### La página funciona en `/`, pero una ruta devuelve 404 al recargar

Agregar `client/vercel.json` con el rewrite de la sección 6 y redeployar.

### Los enlaces de emails apuntan a localhost

Configurar `APP_URL` y `FRONTEND_URL` en Railway. `API_URL` solo debe apuntar al backend y no reemplaza la URL del frontend.

### No se puede subir un logo

Revisar el tamaño máximo de 2 MB, el tipo MIME permitido y las tres credenciales de Cloudinary. Confirmar que `UPLOAD_PROVIDER=cloudinary` esté configurado en Railway.

### Gemini no responde

Comprobar `GEMINI_API_KEY`, revisar la cuota del proveedor y consultar los logs de Railway sin imprimir la clave.

## 10. Seguridad y mantenimiento

- No registrar JWT, contraseñas, claves SMTP ni `GEMINI_API_KEY`.
- Rotar los valores de `JWT_SECRET`, `ADMIN_ACCESS_SECRET`, SMTP y Gemini si se exponen.
- No versionar archivos `.env`.
- Mantener `NODE_ENV=production` en Railway para activar rate limiting y HSTS.
- Mantener `ENABLE_SWAGGER=false` en producción; habilitarlo temporalmente solo para soporte.
- Hacer backups de MySQL antes de cambios de esquema.
- Vigilar el consumo de Railway para no superar el crédito gratuito.
- Mantener separadas las variables de Preview y Production en Vercel.
- Revisar periódicamente los límites y precios oficiales de Railway y Vercel: los planes gratuitos cambian.

## 11. Referencias oficiales

- [Railway — Free Trial](https://docs.railway.com/pricing/free-trial)
- [Railway — Deploying a monorepo](https://docs.railway.com/deployments/monorepo)
- [Railway — Build configuration](https://docs.railway.com/builds/build-configuration)
- [Vercel — Vite](https://vercel.com/docs/frameworks/frontend/vite)
- [Vercel — Environment variables](https://vercel.com/docs/environment-variables)
