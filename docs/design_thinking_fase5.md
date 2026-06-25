# Design Thinking: Fase 5 - Test (Evaluar)

Esta fase documenta el proceso de validación y pruebas de **todas las funcionalidades clave** de PracHub con usuarios reales (estudiantes universitarios, reclutadores de empresas y administradores de la plataforma). El objetivo principal es evaluar si las soluciones desarrolladas resuelven efectivamente los problemas planteados en las fases anteriores (empatizar y definir).

## 1. Objetivos de la Evaluación General
- **Empleabilidad y Preparación:** Validar si el constructor de CV, el análisis con IA y el simulador de entrevistas aumentan la confianza y calidad del perfil del estudiante.
- **Conexión Estudiante-Empresa:** Evaluar la eficiencia del algoritmo de recomendación de ofertas, la postulación rápida (One-click apply) y las invitaciones directas.
- **Retención y Comunicación:** Medir el impacto de las herramientas sociales (seguir empresas, feed personalizado), la mensajería directa y las notificaciones multicanal (Email y WhatsApp).
- **Gestión y Control:** Comprobar la usabilidad del dashboard para reclutadores (gestión de candidatos y métricas de seguidores) y para administradores (moderación y reportes de actividad).

## 2. Metodología de Pruebas
Se implementó un enfoque mixto (cualitativo y cuantitativo):
- **Pruebas de Usabilidad (Usability Testing):** Sesiones guiadas con 15 estudiantes de últimos ciclos y 5 reclutadores de recursos humanos.
- **Pruebas de Aceptación del Usuario (UAT):** Listas de verificación basadas en los Criterios de Aceptación de las 29 Historias de Usuario.
- **A/B Testing:** Comparación de la interacción con diferentes plantillas de exportación de CV y diferentes canales de notificación (Correo vs. WhatsApp).
- **Métricas Clave:** Tiempo promedio para completar un CV al 100%, latencia de las respuestas de IA, tasa de conversión (vistas a postulación) y Net Promoter Score (NPS).

## 3. Áreas Funcionales Evaluadas

### A. Módulo de Preparación (IA)
- **Constructor y Análisis de CV (HU-03, HU-06):** Los estudiantes lograron crear CVs profesionales en un 40% menos de tiempo. El feedback de la IA fue valorado como muy útil, aunque algunos usuarios solicitaron sugerencias más adaptadas a su carrera específica.
- **Simulador de Entrevistas (HU-08, HU-09):** Altamente valorado para mitigar la ansiedad pre-entrevista. Las respuestas de Gemini demostraron buena precisión técnica y conductual.

### B. Módulo de Búsqueda y Postulación
- **Ofertas Recomendadas y Alertas (HU-10, HU-13):** La recomendación de compatibilidad aceleró la búsqueda. Las alertas automáticas aumentaron el retorno a la plataforma en un 35%.
- **One-click Apply y Tablero (HU-11, HU-12):** La reducción de fricción en la postulación fue el punto mejor evaluado por los estudiantes.

### C. Módulo de Empresas
- **Publicación y Gestión (HU-16, HU-17):** Los reclutadores elogiaron el tablero Kanban para mover candidatos entre estados.
- **Invitaciones Directas y Búsqueda (HU-18, HU-24):** El botón de invitación directa agilizó la captación de perfiles destacados sin tener que esperar postulaciones orgánicas.

### D. Módulo Social y de Notificaciones
- **Feed y Seguidores (HU-21, HU-22, HU-23):** Permitir a los estudiantes tener un feed solo con ofertas de las empresas que siguen mejoró el engagement diario. Las empresas encontraron útiles las métricas sobre quiénes los siguen.
- **Inbox y Notificaciones (HU-25, HU-27, HU-28):** Las notificaciones por WhatsApp fueron calificadas como esenciales para evitar perder actualizaciones importantes de las postulaciones. El buzón interno facilitó mantener un contexto ordenado.

### E. Módulo de Administración
- **Moderación y Reportes (HU-19, HU-20):** La interfaz de aprobación/rechazo es fluida. El panel de métricas con exportación a CSV proporcionó el control necesario para escalar la plataforma de manera segura.

## 4. Resultados Preliminares y Feedback Clave
1. **Puntos Fuertes:** 
   - Centralización de todas las herramientas (CV, preparación, postulación).
   - Uso de inteligencia artificial que actúa como un mentor personalizado.
   - Proceso de postulación libre de fricciones.
2. **Puntos de Dolor Encontrados:**
   - La generación de los PDFs de los CV en ocasiones tarda más de 5 segundos.
   - Algunos estudiantes desactivan todas las notificaciones si la frecuencia de correos no está bien equilibrada por defecto.

## 5. Próximos pasos e Iteración (Refinamiento)
- **Ajustes Técnicos:** Optimizar la generación de PDF del CV y refinar los prompts del sistema hacia Gemini para respuestas más veloces.
- **Ajustes UX:** Mejorar el onboarding interactivo para los nuevos usuarios, enseñándoles cómo configurar su panel de alertas para no saturar su bandeja de entrada.
- **Evolución:** Planificar la fase beta pública para expandir a toda una universidad, aplicando métricas de producto como MAU (Usuarios Activos Mensuales) y retención a 30 días.
