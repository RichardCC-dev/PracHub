# **LISTADO DE REQUERIMIENTOS**

## **1\. Requerimientos Funcionales (RF)**

### 1.1. RF-01 Registro y autenticación

| ID | Descripción del Requisito Funcional |
| :---- | :---- |
| RF-01.1 | El sistema permite al estudiante registrarse con correo institucional o Google OAuth. |
| RF-01.2 | El sistema valida que el correo pertenezca a un dominio universitario reconocido. |
| RF-01.3 | El sistema permite recuperar contraseña mediante enlace enviado al correo registrado. |
| RF-01.4 | El estudiante puede completar su perfil básico (carrera, ciclo, universidad, disponibilidad). |

### 1.2 Constructor de CV con IA

| ID | Descripción del Requisito Funcional |
| :---- | :---- |
| RF-02.1 | El sistema presenta un formulario guiado por secciones: datos personales, formación, experiencia, habilidades, idiomas y proyectos. |
| RF-02.2 | La IA sugiere redacción profesional en tiempo real para cada campo que el estudiante complete. |
| RF-02.3 | El sistema ofrece al menos tres plantillas de CV diferenciadas por carrera o sector. |
| RF-02.4 | El estudiante puede exportar su CV en formato PDF en cualquier momento. |
| RF-02.5 | El sistema guarda un historial de versiones del CV y permite restaurar versiones anteriores. |
| RF-02.6 | El CV generado queda almacenado como perfil activo y es consumido automáticamente por los módulos de feedback y bolsa de prácticas. |

### 1.3 Feedback de CV y carta de presentación

| ID | Descripción del Requisito Funcional |
| :---- | :---- |
| RF-03.1 | El estudiante puede cargar un CV externo en formato PDF o DOC, o usar su CV activo de la plataforma. |
| RF-03.2 | El estudiante puede escribir o pegar una carta de presentación en un editor de texto integrado. |
| RF-03.3 | La IA analiza el documento sección por sección y retorna observaciones sobre claridad, impacto, ortografía y palabras clave. |
| RF-03.4 | El sistema asigna una puntuación global de 0 a 100 al documento analizado. |
| RF-03.5 | El sistema genera una versión mejorada del documento con los cambios sugeridos aplicados, disponible para descarga. |
| RF-03.6 | La puntuación obtenida queda registrada en el perfil del estudiante y es utilizada como señal de calidad por el motor de recomendación. |

### 1.4 Chat conversacional para entrevistas

| ID | Descripción del Requisito Funcional |
| :---- | :---- |
| RF-04.1 | El estudiante selecciona el área o rol al que postula antes de iniciar la simulación. |
| RF-04.2 | La IA actúa como entrevistador y formula preguntas situacionales, conductuales y técnicas adaptadas al rol seleccionado. |
| RF-04.3 | El estudiante responde en texto libre y la IA evalúa cada respuesta según criterios de estructura (método STAR), claridad y relevancia. |
| RF-04.4 | El sistema entrega retroalimentación inmediata tras cada respuesta con puntos de mejora específicos. |
| RF-04.5 | Al finalizar la sesión, el sistema genera un resumen de desempeño con puntuación por pregunta. |
| RF-04.6 | El estudiante puede acceder al historial de simulaciones anteriores y comparar su progreso entre sesiones. |
| RF-04.7 | El desempeño acumulado en simulaciones es incorporado como señal por el motor de recomendación de ofertas. |

### 1.5 Bolsa de prácticas y postulaciones

| ID | Descripción del Requisito Funcional |
| :---- | :---- |
| RF-05.1 | El estudiante visualiza un catálogo de ofertas vigentes con información de empresa, sector, modalidad, duración y requisitos. |
| RF-05.2 | El sistema muestra un ranking personalizado de ofertas recomendadas basado en el perfil activo del estudiante. |
| RF-05.3 | El estudiante puede filtrar ofertas por sector, modalidad (presencial/remoto/híbrido), duración y ubicación. |
| RF-05.4 | El estudiante puede postular a una oferta con un clic, usando su CV activo y carta de presentación almacenada. |
| RF-05.5 | El sistema muestra el estado de cada postulación: enviada, en revisión, descartada o aceptada. |
| RF-05.6 | El estudiante recibe notificaciones cuando aparece una nueva oferta compatible con su perfil o cuando cambia el estado de una postulación. |
| RF-05.7 | El estudiante accede a un dashboard personal con métricas de actividad: postulaciones, visitas a su perfil y puntuaciones acumuladas. |
| RF-05.8 | El estudiante puede "seguir" a sus empresas favoritas para visualizar sus nuevas ofertas de prácticas de manera destacada en su catálogo.  |

### 1.6 Registro y perfil de empresa

| ID | Descripción del Requisito Funcional |
| :---- | :---- |
| RF-06.1 | La empresa se registra con RUC o NIT, razón social, sector y datos de contacto del responsable de RRHH. |
| RF-06.2 | El sistema verifica la existencia legal de la empresa mediante integración con registros públicos o validación manual. |
| RF-06.3 | La empresa puede personalizar su página de perfil con descripción, cultura organizacional y logotipo. |

### 1.7 Gestión de ofertas de prácticas

| ID | Descripción del Requisito Funcional |
| :---- | :---- |
| RF-07.1 | La empresa puede crear una oferta de práctica especificando: puesto, área, requisitos, modalidad, duración, compensación y fecha límite. |
| RF-07.2 | La empresa puede publicar, pausar o cerrar sus ofertas en cualquier momento. |
| RF-07.3 | La empresa visualiza el número de postulantes por oferta y puede acceder a cada perfil de candidato. |
| RF-07.4 | La empresa puede cambiar el estado de cada postulación (en revisión, descartado, seleccionado) y el candidato es notificado automáticamente. |
| RF-07.5 | La empresa puede dejar comentarios internos sobre cada candidato, visibles solo para su equipo. |

### 1.8 Búsqueda y recomendación de candidatos

| ID | Descripción del Requisito Funcional |
| :---- | :---- |
| RF-08.1 | La empresa puede buscar candidatos por carrera, habilidades, universidad e idiomas. |
| RF-08.2 | El motor de recomendación sugiere automáticamente candidatos afines a las ofertas publicadas por la empresa. |
| RF-08.3 | La empresa puede invitar directamente a un candidato a postular a una de sus ofertas activas. |

### 1.9 Matching y recomendación

| ID | Descripción del Requisito Funcional |
| :---- | :---- |
| RF-09.1 | El sistema calcula un score de compatibilidad entre cada estudiante y cada oferta, cruzando carrera, habilidades, disponibilidad e idiomas. |
| RF-09.2 | El score incorpora la puntuación de calidad del CV (RF-03.4) como ponderador positivo en el ranking. |
| RF-09.3 | El score incorpora el desempeño acumulado en simulaciones de entrevista (RF-04.5) como señal adicional de preparación. |
| RF-09.4 | El sistema actualiza el ranking de recomendaciones del estudiante cada vez que su perfil o sus puntuaciones cambien. |
| RF-09.5 | El sistema explica al estudiante, en lenguaje sencillo, por qué una oferta fue recomendada (ej. "coincide con tu carrera y tu nivel de inglés"). |

### 1.10 Gestión y moderación

| ID | Descripción del Requisito Funcional |
| :---- | :---- |
| RF-10.1 | El administrador puede aprobar, suspender o eliminar cuentas de empresas o estudiantes. |
| RF-10.2 | El administrador puede revisar y moderar ofertas publicadas antes de que sean visibles en el catálogo. |
| RF-10.3 | El sistema genera reportes de actividad: número de postulaciones, tasa de contratación, módulos más usados y perfiles más visitados. |
| RF-10.4 | El administrador puede gestionar el catálogo de universidades reconocidas por la plataforma. |

### 1.11 Mensajería directa

| ID | Descripción del Requisito Funcional |
| :---- | :---- |
| RF-11.1  | El sistema cuenta con un buzón de mensajería (inbox) que permite a los reclutadores iniciar conversaciones directas con los candidatos (InMail).  |
| RF-11.2 | El sistema permite a los estudiantes buscar perfiles de otros estudiantes y enviarles mensajes directos para fomentar el networking. |

### 1.12 Alertas y notificaciones

| ID | Descripción del Requisito Funcional |
| :---- | :---- |
| RF-12.1  | El sistema envía correos electrónicos transaccionales y mensajes por WhatsApp al estudiante ante eventos clave (ej. "Tu CV ha sido visto por la empresa X").  |
| RF-12.2 | Los usuarios pueden configurar sus preferencias de privacidad y decidir qué tipo de notificaciones externas desean recibir.  |