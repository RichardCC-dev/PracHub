
# Documento de Diseño UX/UI - PracHub

* **Estilo Base:** Minimalista, limpio, enfocado en reducir la carga cognitiva (esencial para evitar la frustración y la parálisis por análisis de los estudiantes).


* **Esquema de Colores:** Blanco (dominante) y Verde Oscuro (acento y CTA).



### 1. Sistema de Diseño (UI Kit Base)

* **Color de Fondo Principal:** Blanco puro (#FFFFFF) y gris muy claro (#F9FAFB) para diferenciar secciones, formularios, tarjetas o contenedores.

* **Color Primario (Acento):** Verde Oscuro (#064E3B o #047857). Se usará exclusivamente en Botones Principales (CTA), íconos clave, notificaciones y porcentajes de compatibilidad para guiar la atención del usuario sin abrumarlo.

* **Tipografía:** Google_Sans moderna y sumamente legible. Los títulos irán en negrita (Bold) y el cuerpo de texto en peso regular.

* **Componentes Clave:**
    * **Tarjetas (Cards):** Fondo blanco, bordes redondeados muy sutiles y sombra ligera. Se utilizarán para listar las ofertas, el historial de chats y los perfiles.
    * **Botones (CTA):** Verdes oscuros con texto blanco (ej. "Postular con un clic", "Analizar CV"). Botones secundarios con borde verde y fondo transparente o blanco (ej. "Guardar borrador", "Descargar PDF").

---

### 2. Arquitectura Visual de Pantallas y Distribución de HUs

A continuación, la estructura de las pantallas principales agrupando de manera lógica las 29 historias de usuario de PracHub:

#### **Pantalla 1: Portal de Acceso (Onboarding y Autenticación)**

* **Enfoque:** Simpleza para que la fricción de entrada sea mínima.

* **Diseño:** Pantalla limpia. Formulario minimalista centrado o un diseño de dos columnas (una con el isotipo de PracHub sobre fondo verde y la otra en blanco).

* **Elementos UX:**
    * Botón destacado y amigable para "Registrarse con Google".
    * Formularios limpios de campos de texto grandes para registro con correo universitario.
    * Enlace visible de "Recuperar contraseña".

* **Cobertura:** HU-01 (Registro Estudiante), HU-02 (Recuperación Contraseña), HU-14 (Registro y validación de Empresa).

#### **Pantalla 2: Dashboard Principal del Estudiante & Bolsa de Prácticas**

* **Enfoque:** Feed principal de tarjetas, donde el matching resalta de inmediato.

* **Diseño:** Menú lateral de navegación vertical (Dashboard, Ofertas, Chat, CV). Área central abarcando un feed o catálogo de ofertas.

* **Elementos UX:**
    * **Tarjetas de Ofertas:** Cada tarjeta muestra rol, nombre de la empresa, etiquetas, y de manera prominente un indicador circular en Verde Oscuro resaltando el porcentaje de compatibilidad.
    * **Botón 1-Clic:** Botón primario verde ("Postular") en cada tarjeta.
    * **Sección Favoritos:** Ícono de "Estrella" verde para seguir empresas y un feed filtrado dedicado a las empresas seguidas.

* **Cobertura:** HU-10 (Ranking recomendado), HU-11 (Postulación 1-clic), HU-13 (Alertas compatibles), HU-21 (Seguimiento empresas), HU-22 (Feed empresas seguidas).

#### **Pantalla 3: Constructor y Optimizador de CV (Módulo de Talento)**

* **Enfoque:** Pantalla de doble panel para facilitar un asistente (Wizard) paso a paso sin recargar la vista.

* **Diseño:**
    * Izquierda (60%): Formulario modular en blanco con pasos claros (Datos, Formación, Habilidades, Proyectos).
    * Derecha (40%): Panel lateral o previsualización del documento en tiempo real en un entorno gris claro.

* **Elementos UX:**
    * **Sugerencias IA en Tiempo Real:** Al escribir en un campo, emerge sutilmente un globo o badge verde (IA) sugiriendo redacción profesional.
    * **Analizador:** Si decide subir su archivo, se habilita una caja de "Drag & Drop", y al lado un gráfico circular verde muestra la puntuación global del CV (0 a 100).
    * **Opciones Finales:** Botones secundarios para elegir 3 plantillas de diseño diferentes y un desplegable para el historial de versiones guardadas.

* **Cobertura:** HU-03 (Constructor IA), HU-04 (Exportar PDF), HU-05 (Historial versiones), HU-06 (Análisis de CV), HU-07 (Análisis Carta de Presentación).

#### **Pantalla 4: Simulador de Entrevistas (Entrenador IA)**

* **Enfoque:** Interfaz de chat inmersiva, inspirada en plataformas modernas de mensajería (tipo WhatsApp Web).

* **Diseño:** Área central exclusiva de chat, con un menú lateral izquierdo para ver sesiones pasadas.

* **Elementos UX:**
    * **Burbujas de Chat:** Blancas para la IA (Entrevistador) y Verdes Oscuras para las respuestas del estudiante.
    * **Feedback Visual:** Tarjetas discretas de retroalimentación debajo de cada respuesta del estudiante, detallando qué mejorar (método STAR, claridad).
    * **Barra de Estado Superior:** Muestra el rol que se está simulando y el puntaje acumulado o historial.

* **Cobertura:** HU-08 (Simulador conversacional), HU-09 (Historial y Progreso simulaciones).



#### **Pantalla 5: Panel de Gestión (Tablero de Trazabilidad y Embudo B2B)**

* 
**Enfoque:** Tablero visual tipo Kanban.

* **Diseño (Para Estudiante):** Tablero organizado en 4 columnas principales ("Enviada", "En revisión", "Descartada", "Aceptada").

* **Diseño (Para Empresa):** Tablero homólogo que permite a los reclutadores gestionar su embudo con tarjetas de candidatos que pueden mover de estado a estado.


* **Elementos UX:**
    * Tarjetas minimalistas y arrastrables (Drag & Drop) para cada postulación/candidato.
    * En la vista de empresa, botón verde claro para "Publicar nueva oferta" y campos para dejar notas internas.

* **Cobertura:** HU-12 (Tablero estudiante), HU-16 (Publicación Ofertas prácticas), HU-17 (Gestión de candidatos).

#### **Pantalla 6: Inbox y Networking (Ecosistema Social)**

* **Enfoque:** Bandeja de entrada estructurada a dos paneles.

* **Diseño:** Panel izquierdo listando los hilos de conversaciones; panel derecho con el hilo de chat activo abierto.

* **Elementos UX:**
    * Botones estratégicos de "Enviar Mensaje" integrados en el perfil de cada candidato y empresa.
    * Opción visible para las empresas de enviar "Invitación directa a postular".

* **Cobertura:** HU-18 (Invitación directa postulación), HU-24 (Envío mensaje a candidato), HU-25 (Bandeja Inbox Estudiante), HU-26 (Mensajería Networking).

#### **Pantalla 7: Configuración de Preferencias y Panel de Moderación (Admin)**

* **Enfoque:** Formularios de ajustes de cuenta limpios y vistas de tablas de datos.

* **Diseño:** Vistas en forma de lista y tablas limpias (líneas finas grises, poco ruido visual).

* **Elementos UX:**
    * **Panel de Notificaciones:** "Switches" (interruptores) verdes estilo toggle para activar/desactivar notificaciones transaccionales vía Email o WhatsApp.


    * **Perfil de Empresa:** Enriquecido con logo superior grande, descripción y etiquetas.


    * **Vista Administrador:** Tablas de datos con gráficos ligeros y botones de "Aprobar" / "Rechazar" ofertas.

* **Cobertura:** HU-15 (Personalización perfil Empresa), HU-19 (Moderación ofertas Admin), HU-20 (Reportes actividad Admin), HU-23 (Panel de métricas), HU-27, HU-28, HU-29 (Configuración Notificaciones Email, WhatsApp y Preferencias).