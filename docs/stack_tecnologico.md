### **Documento de Arquitectura y Stack Tecnológico (PracHub)**

---

### **1. Capa de Presentación (Frontend)**

El frontend será responsable de la interactividad en tiempo real y la gestión de interfaces complejas (formularios dinámicos y simuladores de chat).

| Tecnología / Librería | Propósito en el Proyecto |
| --- | --- |
| **React** | Framework principal para la construcción de interfaces modulares bajo el modelo SPA.
| **Zustand / Redux Toolkit** | Gestión centralizada de estados complejos y datos del perfil del usuario.
| **React Hook Form** | Optimización de rendimiento y validación para formularios extensos (ej. Constructor de CV).
| **Tailwind CSS** | Sistema de diseño unificado para garantizar la coherencia visual en todas las vistas y acelerar el desarrollo.

---

### **2. Capa de Lógica de Negocio (Backend)**

El backend funcionará como el núcleo central, responsable exclusivo de la lógica de negocio, reglas de matching, seguridad y comunicación externa.

| Tecnología / Librería | Propósito en el Proyecto |
| --- | --- |
| **Node.js + Express** | Entorno de ejecución y framework para construir una API REST ágil, ideal para manejar peticiones asíncronas de IA sin bloquear otros procesos.
| **JSON Web Tokens (JWT)** | Gestión de sesiones seguras y control de acceso basado en roles (Estudiante, Empresa, Admin).
| **Bcrypt** | Encriptación y hashing con sal de contraseñas de usuarios en la base de datos.
| **OpenAPI / Swagger** | Documentación estandarizada de todos los endpoints de la API REST.

---

### **3. Capa de Persistencia de Datos (Base de Datos)**

La plataforma manejará un esquema de datos altamente relacional para garantizar la integridad transaccional del negocio.

| Tecnología / Herramienta | Propósito en el Proyecto |
| --- | --- |
| **MySQL** | Base de datos principal para almacenar usuarios, perfiles, ofertas y seguimiento de postulaciones.
| **Sequelize (ORM)** | Abstracción de base de datos para manejar consultas complejas (JOINs para matching), migraciones y evitar la escritura de SQL en texto plano, previniendo inyecciones SQL.

---

### **4. Integraciones y Servicios Externos (APIs)**

El sistema delegará funcionalidades operativas a proveedores externos de alta disponibilidad.

* **Modelos de Inteligencia Artificial:** Integración con la API de Google Gemini. Esta conexión debe realizarse obligatoriamente desde el entorno seguro de Node.js, nunca desde React. El módulo debe estar desacoplado para permitir cambiar de proveedor en el futuro.

* **Mensajería Transaccional (Email):** Para el envío de notificaciones y recuperación de contraseñas.

* **Mensajería Instantánea (WhatsApp):** Integración con la API oficial de WhatsApp Business (mediante Twilio o Vonage) para notificaciones prioritarias.

---

### **5. Estándares de Código y Calidad (Para Agentes IA)**

Para mantener la escalabilidad y un código limpio, el equipo y los agentes de generación de código deben apegarse a las siguientes directrices:

* **Modularidad de Arquitectura:** El código del backend debe dividirse estrictamente en rutas (routers), controladores (controllers), servicios (services) y modelos (models).


* **Formateo y Sintaxis:** Uso obligatorio de **ESLint** y **Prettier** para automatizar el formateo del código y evitar discrepancias de estilo entre archivos.


* **Seguridad:** El código generado debe proteger contra las vulnerabilidades del OWASP Top 10 (CSRF, XSS, exposición de datos).
