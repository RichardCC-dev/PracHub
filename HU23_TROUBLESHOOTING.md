# **TROUBLESHOOTING - HU-23**

## **Error: 401 Unauthorized al acceder a /api/company-metrics/**

### Síntomas
```
error: 'Error: 401 Unauthorized'
```

### Causas Posibles
1. Token JWT expirado
2. Token no incluido en header `Authorization: Bearer <TOKEN>`
3. Token inválido o corrupto

### Solución
```javascript
// Verificar en browser console:
console.log(localStorage.getItem('prachub_token'));
// o
console.log(sessionStorage.getItem('prachub_token'));

// Si está vacío, hacer logout y login de nuevo
```

---

## **Error: 403 Forbidden (No autorizado)**

### Síntomas
```
error: 'No autorizado. Solo empresas pueden acceder.'
```

### Causas
- Estás logueado como estudiante, no como empresa
- El rol en el token no es 'company'

### Solución
1. Logout (icono avatar → Cerrar sesión)
2. Login como empresa (usa credenciales de empresa)
3. Verifica en DevTools:
```javascript
// Console:
const token = localStorage.getItem('prachub_token');
const decoded = JSON.parse(atob(token.split('.')[1])); // Payload
console.log(decoded.role); // Debe ser 'company'
```

---

## **Error: "Cannot read property 'length' of undefined"**

### Síntomas
```
TypeError: Cannot read property 'length' of undefined at FollowersDistribution.jsx:20
```

### Causas
- API retornó `null` en lugar de array
- Data aún no está lista cuando el componente intenta renderizar

### Solución
Código ya incluye protección:
```javascript
// FollowersDistribution.jsx
if (!items || items.length === 0) {
  return <div>Sin datos disponibles</div>;
}
```

Si sigue dando error:
1. Verifica que la empresa tenga al menos 1 seguidor
2. Revisa server logs: `tail -f server/logs/*.log`

---

## **Error: API endpoint retorna 500**

### Síntomas
```
error: 'Error al obtener métricas'
status: 500
```

### Causas Posibles
1. Base de datos desconectada
2. Error en la query SQL
3. Company no existe en DB

### Solución
```bash
# 1. Verificar conexión a DB
mysql -u root -p prachub -e "SELECT 1;"

# 2. Verificar que la empresa existe
mysql -u root -p prachub -e "SELECT * FROM Companies WHERE user_id = <USER_ID>;"

# 3. Ver logs del servidor
tail -f server/logs/error.log

# 4. Reiniciar servidor
npm run dev (en terminal server/)
```

---

## **Error: Gráfico no renderiza (CompanyMetricsChart)**

### Síntomas
- Componente carga pero no muestra gráfico
- Área vacía en lugar del LineChart

### Causas
- Recharts no instalado
- Data vacía o malformada

### Solución
```bash
# Instalar Recharts si no está
cd client && npm install recharts

# Verificar data:
console.log(growthData); // Ver en DevTools
```

---

## **Error: Sidebar no muestra "Métricas de seguidores"**

### Síntomas
- Opción no aparece en sidebar después de login como empresa

### Causas
- Cambios en Sidebar.jsx no recompilados
- Vite cache corrupted

### Solución
```bash
# 1. Limpiar cache de Vite
rm -rf client/node_modules/.vite

# 2. Reiniciar dev server
npm run dev (en terminal client/)

# 3. Force refresh en navegador (Ctrl+Shift+R en Windows, Cmd+Shift+R en Mac)
```

---

## **Error: "SavedCompany is not associated with Student"**

### Síntomas
```
SequelizeError: SavedCompany is not associated with Student
```

### Causa
- Relación entre modelos no está definida correctamente
- `include: [{model: Student, as: 'student'}]` falla

### Solución
Verificar en `server/src/models/SavedCompany.js` (o donde se defina):
```javascript
// Debe estar:
SavedCompany.belongsTo(Student, { 
  foreignKey: 'studentId',
  as: 'student' 
});

// Si no está, agregarlo:
module.exports = (sequelize, DataTypes) => {
  const SavedCompany = sequelize.define('SavedCompany', { ... });
  
  SavedCompany.associate = (models) => {
    SavedCompany.belongsTo(models.Student, { 
      foreignKey: 'studentId',
      as: 'student'
    });
    SavedCompany.belongsTo(models.Company, { ... });
  };
  
  return SavedCompany;
};
```

---

## **Error: Rate limit (429 Too Many Requests)**

### Síntomas
```
error: 'Too Many Requests'
status: 429
```

### Causa
- Has hecho >100 requests en 15 minutos desde la misma IP

### Solución
```bash
# Esperar 15 minutos, o
# Cambiar IP (VPN), o
# En desarrollo, el rate limit está desactivado en app.js
# Verificar: NODE_ENV=development
```

---

## **Error: Fetch error - CORS**

### Síntomas
```
Access to XMLHttpRequest at 'http://localhost:4000/api/company-metrics/followers' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

### Causa
- Headers CORS no están configurados en backend

### Solución
En `server/src/app.js`, verificar CORS:
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://tu-dominio.com'
  ],
  credentials: true,
}));
```

---

## **Error: Metrics muestra 0 seguidores siempre**

### Síntomas
```
totalFollowers: 0
```

### Causas
1. No hay seguidores de verdad (esperado en testing inicial)
2. SavedCompany records no están vinculados correctamente

### Solución
```sql
-- Verificar datos en DB:
SELECT COUNT(*) FROM Saved_Companies 
WHERE company_id = (SELECT id FROM Companies WHERE user_id = <YOUR_COMPANY_USER_ID>);

-- Si da 0, crear un seguidor de prueba:
INSERT INTO Saved_Companies (student_id, company_id, saved_at)
SELECT s.id, c.id, NOW()
FROM Students s, Companies c
WHERE s.user_id = <STUDENT_USER_ID> 
  AND c.user_id = <COMPANY_USER_ID>;
```

---

## **Performance Issue: Página lenta**

### Síntomas
- Página tarda >3s en cargar
- Gráfico se demora en renderizar

### Causas
- Muchos seguidores (query lenta)
- React Query no está cacheando

### Solución
```javascript
// En client/src/hooks/useCompanyMetrics.js:
staleTime: 5 * 60 * 1000,  // Caché 5 min
gcTime: 10 * 60 * 1000,    // Mantener 10 min

// Aumentar si es necesario:
staleTime: 15 * 60 * 1000,  // 15 min
gcTime: 30 * 60 * 1000,     // 30 min
```

```javascript
// En backend, agregar índice:
// server/src/migrations/[date]-add-indexes.js
ALTER TABLE Saved_Companies 
ADD INDEX idx_company_id (company_id);
```

---

## **Testing en Postman: Bearer token inválido**

### Problema
```
error: 'Invalid token'
```

### Solución
1. Obtener token valido:
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"company@test.com","password":"pass123"}'
```

2. Copiar el `token` de la respuesta

3. Usar en header:
```
Authorization: Bearer <PASTE_TOKEN_HERE>
```

---

## **Hot Issues**

| Problema | Solución Rápida |
|----------|-----------------|
| Rutas no encontradas (404) | Verificar que las rutas están en App.jsx |
| Componente no renderiza | Verificar lazy() import |
| API 500 | Revisar server logs |
| Sidebar desactualizado | Limpiar cache Vite + force refresh |
| Token expirado | Logout + login |

---

## **DEBUG MODE**

Para debug avanzado, agregar logs:

```javascript
// Backend - companyMetricsController.js:
logger.info(`[DEBUG] userId: ${userId}`);
logger.info(`[DEBUG] company: ${JSON.stringify(company)}`);

// Frontend - useCompanyMetrics.js:
console.log('[DEBUG] Metrics data:', data);
```

---

**¿Sigue sin funcionar?**

1. Revisa los logs:
   - Backend: `server/logs/`
   - Frontend: DevTools Console (F12)

2. Abre issue en GitHub con:
   - Paso que falla
   - Error exacto
   - Logs relevantes
   - Pasos para reproducir

---
