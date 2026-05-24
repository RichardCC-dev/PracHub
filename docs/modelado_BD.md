### **1\. Módulo Central: Autenticación y Perfiles**

Este módulo maneja el control de acceso y la información pública o de contacto de los usuarios.

| Tabla de Base de Datos | Propósito | Campos Clave (Columnas) | Relaciones |
| :---- | :---- | :---- | :---- |
| **Users** | Maneja la autenticación y los roles del sistema. |  id, email, password\_hash, role (student, company, admin), created\_at |  **1:1** con Students o Companies. |
| **Students** | Almacena los datos personales y académicos del candidato. |  id, user\_id (FK), first\_name, last\_name, university, career, bio , phone\_number, profile\_picture\_url | Pertenece a un User. |
| **Companies** | Almacena el perfil público de la organización. |  id, user\_id (FK), legal\_name, description, industry, logo\_url , is\_verified (Booleano), website\_url | Pertenece a un User. |

### **2\. Módulo Transaccional: Bolsa de Trabajo y Matching**

Aquí se estructura el flujo B2B (Business-to-Business) y el motor de compatibilidad relacional.

| Tabla de Base de Datos | Propósito | Campos Clave (Columnas) | Relaciones |
| :---- | :---- | :---- | :---- |
| **Offers** | Detalles de la práctica profesional publicada. |  id, company\_id (FK), title, description, requirements\_json, status (activa, cerrada) , modality (remoto, presencial, híbrido), created\_at, expires\_at |  **1:N** con Applications. |
| **Skills** | Catálogo relacional de habilidades para el algoritmo de matching. |  id, name, category | Se relaciona mediante tablas intermedias. |
| **Student\_Skills** / **Offer\_Skills** | Relaciona qué habilidades tiene un estudiante y cuáles pide una oferta. | student\_id o offer\_id (FK), skill\_id (FK) | Tablas intermedias (**N:M**). |
| **Applications** | Trazabilidad del embudo B2B (Kanban de postulaciones). |  id, student\_id (FK), offer\_id (FK), resume\_id (FK) , status (enviada, revision, descartada, aceptada), applied\_at | Tabla intermedia (**N:M**). |
| **Saved\_Companies** | Almacena las empresas favoritas del estudiante. |  id, student\_id (FK), company\_id (FK), saved\_at | Tabla intermedia (**N:M**). |

### **3\. Módulo de Inteligencia Artificial (Talento y Entrenamiento)**

Centraliza todos los artefactos generados o evaluados por la IA.

| Tabla de Base de Datos | Propósito | Campos Clave (Columnas) | Relaciones |
| :---- | :---- | :---- | :---- |
| **Resumes (CVs)** | Guarda las versiones del currículum generadas o analizadas. |  id, student\_id (FK), content\_json (datos del CV), ai\_score (0-100), pdf\_file\_url |  **1:N** con Students. |
| **Simulations** | Historial del simulador conversacional de entrevistas. |  id, student\_id (FK), simulated\_role, overall\_score, ai\_feedback\_summary, date |  **1:N** con Students. |

### **4\. Módulo de Ecosistema Social y Notificaciones**

Gestiona la comunicación interna y el sistema de alertas de la plataforma.

| Tabla de Base de Datos | Propósito | Campos Clave (Columnas) | Relaciones |
| :---- | :---- | :---- | :---- |
| **Conversations** | Hilo o sala de chat entre dos partes. |  id, participant\_one\_id (FK), participant\_two\_id (FK), last\_message\_at | Relaciona a dos Users. |
| **Messages** | Mensajes individuales dentro de una conversación. |  id, conversation\_id (FK), sender\_id (FK), content, is\_read, sent\_at |  **1:N** con Conversations. |
| **Notifications** | Manejar la campanita de alertas dentro de la app (compatibilidad, mensajes, estados). |  id, user\_id (FK), title, content, type (system, application, match), is\_read (Booleano), created\_at | **1:N** con Users. |

### **5\. Módulo de Administración y Auditoría**

Garantiza la trazabilidad de las acciones tomadas por los moderadores para auditorías futuras.

| Tabla de Base de Datos | Propósito | Campos Clave (Columnas) | Relaciones |
| :---- | :---- | :---- | :---- |
| **Admin\_Logs** | Registro de acciones para cubrir los reportes de actividad (HU-20). |  id, admin\_user\_id (FK), action\_taken (ej. "Aprobó empresa X", "Eliminó oferta Y"), timestamp | **1:N** con Users (solo rol Admin). |

