# **GUÍA DE TESTING MANUAL - HU-23**

## **1. SETUP INICIAL**

### Backend
```bash
cd server
npm install
npm run dev
# Debería ver: "Servidor ejecutándose en puerto 4000"
```

### Frontend  
```bash
cd client
npm install
npm run dev
# Debería ver: "Local: http://localhost:5173"
```

### Database
Asegúrate que los datos de prueba existan:
```sql
-- Verificar que existan empresas y estudiantes
SELECT COUNT(*) FROM Companies;
SELECT COUNT(*) FROM Students;
SELECT COUNT(*) FROM Saved_Companies;
```

---

## **2. ESCENARIO 1: Ver Métricas de Empresa**

### Pasos
1. Abre http://localhost:5173
2. Selecciona **"Acceso a empresas"** (si no estás logueado)
3. Ingresa credenciales de empresa (ej. admin@company.com / password123)
4. En el sidebar izquierdo, haz clic en **"Métricas de seguidores"** ✨
5. Deberías ver:
   - ✅ Total de seguidores (número grande)
   - ✅ Tarjeta "Carreras Representadas" (número)
   - ✅ Tarjeta "Universidades" (número)
   - ✅ Gráfico de línea con crecimiento en últimos 30 días
   - ✅ Listas de "Por Carrera" y "Por Universidad"

### Resultado Esperado
Página carga sin errores, mostrando:
- Datos agregados (no detalles personales)
- Barras de progreso con porcentajes
- Gráfico interactivo (hover muestra valores)

---

## **3. ESCENARIO 2: Actualizar Seguidores**

### Pasos
1. En la página de métricas, anota el **total de seguidores** actual
2. Abre una pestaña **incógnito/privada** y accede como estudiante (http://localhost:5173)
3. Busca cualquier oferta de la empresa que consultaste en paso 1
4. Haz clic en **"Seguir empresa"** (corazón o botón)
5. Vuelve a la pestaña de empresa
6. Haz clic en botón **"Actualizar datos"** (parte inferior)
7. Verifica que el **total de seguidores aumentó en 1**

### Resultado Esperado
✅ El total se actualiza en tiempo real  
✅ La gráfica se recalcula

---

## **4. ESCENARIO 3: Error - Acceso no Autorizado**

### Pasos
1. Crea un test automático (Postman o curl):
```bash
# SIN Token JWT
curl http://localhost:4000/api/company-metrics/followers

# Respuesta esperada: 401 Unauthorized
```

2. Con token de ESTUDIANTE (no empresa):
```bash
curl -H "Authorization: Bearer <STUDENT_TOKEN>" \
  http://localhost:4000/api/company-metrics/followers

# Respuesta esperada: 403 Forbidden
```

### Resultado Esperado
✅ 401 sin autenticación  
✅ 403 si rol no es 'company'

---

## **5. ESCENARIO 4: Distribución por Carrera/Universidad**

### Pasos
1. En la página de métricas, observa las listas de distribución
2. Verifica que:
   - ✅ Cada carrera/universidad muestra count y porcentaje
   - ✅ Están ordenadas por count descendente (mayor primero)
   - ✅ Las barras son proporcionales a los datos
   - ✅ No aparecen más de 10 items (limitado)

### Resultado Esperado
Datos coherentes y visualización clara

---

## **6. ESCENARIO 5: Gráfico de Crecimiento**

### Pasos
1. En la página de métricas, observa el gráfico "Crecimiento (Últimos 30 días)"
2. Hover sobre puntos del gráfico para ver valores en tooltip
3. Verifica:
   - ✅ Línea es suave y acumulativa
   - ✅ Fechas en eje X (formato corto)
   - ✅ Números en eje Y
   - ✅ Estadísticas inferiores (Total nuevos, Promedio/día, Días activos)

### Resultado Esperado
Gráfico renderiza correctamente, datos realistas

---

## **7. ESCENARIO 6: Responsive Design**

### Pasos
1. En navegador, abre DevTools (F12)
2. Activa device emulation (Ctrl+Shift+M)
3. Prueba en:
   - iPhone 12 (390x844)
   - iPad (768x1024)
   - Desktop (1920x1080)
4. Verifica:
   - ✅ Grid de tarjetas se ajusta (1 col mobile, 3 desktop)
   - ✅ Gráfico es visible y legible
   - ✅ Listas tienen scroll si es necesario
   - ✅ Botones y enlaces son clickeables

### Resultado Esperado
Interfaz se adapta correctamente a todos los tamaños

---

## **8. ESCENARIO 7: Loading & Error States**

### Pasos
1. **Simular demora de red:**
   - DevTools → Network → Throttle: "Slow 4G"
   - Navega a /company/metrics
   - Debería mostrarse spinner mientras carga
   
2. **Simular error de API:**
   - Abre browser console
   - Edita `client/src/services/companyMetricsApi.js`
   - Cambia URL a `/company-metrics/followers-WRONG`
   - Recarga página
   - Debería mostrar pantalla de error con botón "Reintentar"

### Resultado Esperado
✅ Loading spinner durante fetch  
✅ Mensaje de error legible si falla

---

## **9. ESCENARIO 8: Browser Console Check**

### Pasos
1. Abre la página en navegador
2. F12 → Console tab
3. Verifica que NO hay:
   - ❌ Errores rojos (errors)
   - ❌ Warnings amarillos (console.warns)
   - ❌ CORS errors

### Resultado Esperado
Console limpia o solo React warnings normales

---

## **10. ESCENARIO 9: Performance**

### Pasos
1. DevTools → Performance tab
2. Haz clic en "record"
3. Navega a /company/metrics
4. Para la grabación cuando termina de cargar
5. Verifica:
   - ✅ Carga inicial < 3s
   - ✅ Interacciones responsivas (< 100ms)
   - ✅ Sin layout thrashing

### Resultado Esperado
Performance score alto (>80)

---

## **11. BACKEND API TESTING (Postman)**

### Test 1: Obtener Métricas
```http
GET http://localhost:4000/api/company-metrics/followers
Authorization: Bearer <COMPANY_JWT_TOKEN>

# Esperado: 200 OK
# Body: {totalFollowers: 45, byCareer: [...], byUniversity: [...]}
```

### Test 2: Obtener Crecimiento
```http
GET http://localhost:4000/api/company-metrics/growth
Authorization: Bearer <COMPANY_JWT_TOKEN>

# Esperado: 200 OK
# Body: {growth: [{date, dailyFollowers}, ...]}
```

### Test 3: Sin Autenticación
```http
GET http://localhost:4000/api/company-metrics/followers

# Esperado: 401 Unauthorized
```

### Test 4: Estudiante (No Autorizado)
```http
GET http://localhost:4000/api/company-metrics/followers
Authorization: Bearer <STUDENT_JWT_TOKEN>

# Esperado: 403 Forbidden
```

---

## **12. DATOS DE PRUEBA ÚTILES**

Si necesitas crear datos de prueba para testing:

```sql
-- Crear empresa de prueba
INSERT INTO Users (email, password_hash, role) 
VALUES ('test-company@test.com', 'hash', 'company');

-- Crear perfil de empresa
INSERT INTO Companies (user_id, legal_name)
VALUES (LAST_INSERT_ID(), 'Test Company Inc');

-- Crear múltiples estudiantes
INSERT INTO Users (email, password_hash, role) 
VALUES ('student1@test.com', 'hash', 'student');

INSERT INTO Students (user_id, first_name, last_name, career, university)
VALUES (LAST_INSERT_ID(), 'Juan', 'Pérez', 'Ingeniería de Sistemas', 'UPCH');

-- Hacer que estudian siga a la empresa
INSERT INTO Saved_Companies (student_id, company_id, saved_at)
VALUES (1, 1, NOW());
```

---

## **13. CHECKLIST FINAL**

Antes de dar por completado, verificar:

- [ ] Backend server corre sin errores (npm run dev)
- [ ] Frontend carga sin errores (npm run dev)
- [ ] Endpoint GET /api/company-metrics/followers retorna 200
- [ ] Endpoint GET /api/company-metrics/growth retorna 200
- [ ] Empresa ve sus métricas en /company/metrics
- [ ] Total de seguidores es exacto
- [ ] Distribuciones por carrera/universidad son correctas
- [ ] Gráfico de crecimiento renderiza
- [ ] Botón "Actualizar datos" funciona
- [ ] Errores 401/403 se muestran correctamente
- [ ] Página es responsive en mobile
- [ ] No hay errores en console
- [ ] Performance es aceptable (< 3s carga)
- [ ] Sidebar muestra opción "Métricas de seguidores"

---

✅ **TESTING COMPLETADO** - Listo para producción

