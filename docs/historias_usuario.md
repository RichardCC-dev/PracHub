# **DEFINICIÓN DE HU**

## **HU-01 Registro y validación de estudiante**

**Prioridad:** Alta  
Como estudiante universitario, quiero registrarme con mi correo institucional o cuenta Google, para acceder a la plataforma sin crear una contraseña nueva y verificar que soy estudiante activo.  
**Criterios de aceptación**

* El sistema acepta dominios universitarios reconocidos y rechaza correos genéricos no validados.  
* El registro con Google OAuth completa el proceso en menos de 3 pasos.  
* Al finalizar el registro se muestra el formulario de perfil básico (carrera, ciclo, universidad).  
* Si el correo ya existe, el sistema informa que la cuenta fue creada previamente y ofrece recuperar contraseña.

## **HU-02 Recuperación de contraseña**  

**Prioridad:** Media  
Como estudiante registrado, quiero recuperar el acceso a mi cuenta mediante un enlace enviado a mi correo, para no perder mi historial de CV, simulaciones y postulaciones.  
**Criterios de aceptación**

* El enlace de recuperación expira en 30 minutos y solo es válido para un uso.  
* El sistema confirma el envío del correo y no revela si el email existe en la base de datos.  
* Tras restablecer la contraseña, el estudiante es redirigido directamente a su dashboard.

## **HU-03 Constructor de CV guiado por IA**  

**Prioridad:** Alta  
Como estudiante sin experiencia redactando un CV, quiero construir mi hoja de vida guiado por secciones con sugerencias de la IA, para obtener un CV profesional sin necesidad de saber qué escribir en cada campo.  
**Criterios de aceptación**

* El formulario avanza por secciones: datos personales, formación, experiencia, habilidades, idiomas y proyectos.  
* Al escribir en cualquier campo, la IA sugiere una versión mejorada en tiempo real (latencia menor a 3 s).  
* El estudiante puede aceptar, editar o descartar cada sugerencia sin perder lo que ya escribió.  
* El sistema indica el porcentaje de completitud del CV en todo momento.

## **HU-04 Exportación de CV en PDF con plantillas**

**Prioridad:** Alta  
Como estudiante que terminó su CV, quiero descargarlo en PDF con el diseño de la plantilla que elegí, para enviarlo a empresas fuera de la plataforma.  
**Criterios de aceptación**

* El sistema ofrece al menos tres plantillas visualmente distintas, diferenciadas por carrera o sector.  
* El PDF generado respeta exactamente el diseño de la plantilla seleccionada.  
* La descarga inicia en menos de 5 segundos tras confirmar la acción.  
* El nombre del archivo incluye el nombre del estudiante y la fecha de generación.

## **HU-05 Historial de versiones del CV** 

**Prioridad:** Media  
Como estudiante que actualiza su CV con frecuencia, quiero ver el historial de versiones de mi CV y restaurar una anterior, para no perder información si realizo cambios incorrectos.  
**Criterios de aceptación**

* El sistema guarda automáticamente una nueva versión cada vez que el estudiante exporta el CV.  
* El historial muestra fecha, hora y porcentaje de completitud de cada versión.  
* Al restaurar una versión, el sistema pide confirmación antes de sobreescribir la actual.

## **HU-06 Análisis y feedback de CV con IA**  

**Prioridad:** Alta  
Como estudiante que va a postular a una práctica, quiero recibir un análisis detallado de mi CV antes de enviarlo, para corregir errores y mejorar mi puntuación antes de que una empresa lo vea.  
**Criterios de aceptación**

* El análisis se completa en menos de 10 segundos tras subir o seleccionar el documento.  
* El reporte cubre claridad, impacto, ortografía, extensión y palabras clave del sector.  
* Cada observación indica la sección afectada y propone un cambio concreto.  
* El sistema muestra una puntuación global de 0 a 100 con una escala de referencia (ej. menor a 60 \= requiere mejoras).

## **HU-07 Análisis y feedback de carta de presentación con IA**

**Prioridad:** Alta  
Como estudiante que necesita escribir una carta de presentación, quiero obtener retroalimentación de la IA sobre el texto que redacté, para asegurarme de que sea convincente y esté bien estructurada.  
**Criterios de aceptación**

* El estudiante puede escribir o pegar la carta directamente en un editor de texto en la plataforma.  
* La IA evalúa apertura, cuerpo y cierre de la carta por separado.  
* El sistema genera una versión mejorada de la carta completa, disponible para copiar o descargar.  
* La puntuación de la carta queda vinculada al perfil del estudiante.

## **HU-08 Simulador conversacional de entrevistas con IA**

**Prioridad:** Alta  
Como estudiante nervioso ante una entrevista, quiero practicar respondiendo preguntas de selección en un chat con IA, para ganar confianza y aprender a estructurar mis respuestas antes de la entrevista real.  
**Criterios de aceptación**

* El estudiante elige el área o rol antes de iniciar (ej. marketing, ingeniería de software, finanzas).  
* La IA genera preguntas variadas: de presentación, situacionales, conductuales y técnicas.  
* Tras cada respuesta, el sistema entrega feedback inmediato con criterios de evaluación visibles (estructura, claridad, relevancia).  
* La sesión puede pausarse y retomarse sin perder el progreso.

## **HU-09 Historial y progreso de simulaciones** 

**Prioridad:** Media  
Como estudiante que practica con regularidad, quiero ver mi progreso entre sesiones de simulación, para identificar en qué tipo de preguntas mejoro y en cuáles debo seguir practicando.  
**Criterios de aceptación**

* El historial muestra cada sesión con fecha, rol simulado y puntuación total obtenida.  
* El sistema señala las categorías de preguntas con mayor y menor puntuación promedio.  
* El progreso es visible en el dashboard personal del estudiante.

## **HU-10 Ranking de ofertas recomendadas**  

**Prioridad:** Alta  
Como estudiante buscando prácticas, quiero ver un ranking de ofertas recomendadas según mi perfil, para no tener que revisar todas las ofertas manualmente y enfocarme en las más relevantes para mí.  
**Criterios de aceptación**

* El ranking se actualiza automáticamente cada vez que el estudiante mejora su CV, sube su puntuación de feedback o completa una simulación.  
* Cada oferta recomendada muestra el porcentaje de compatibilidad y una razón en lenguaje natural.  
* El estudiante puede marcar una oferta como "no me interesa" para que no aparezca en futuras recomendaciones.

## **HU-11 Postulación rápida (One-click apply)**  

**Prioridad:** Alta  
Como estudiante interesado en una práctica, quiero postular con un clic usando mi CV y carta activos, para no tener que adjuntar documentos manualmente en cada postulación.  
**Criterios de aceptación**

* Al postular, el sistema adjunta automáticamente el CV activo y la carta de presentación almacenada.  
* El estudiante puede previsualizar qué documentos se enviarán antes de confirmar.  
* La postulación queda registrada en el tablero de seguimiento con estado "enviada" y fecha.  
* El sistema impide postular dos veces a la misma oferta y lo informa con un mensaje claro.

## **HU-12 Tablero de seguimiento de postulaciones** 

**Prioridad:** Alta  
Como estudiante que postuló a varias empresas, quiero ver el estado actualizado de cada postulación, para saber cuáles siguen activas y cuáles fueron descartadas sin tener que contactar a cada empresa por separado.  
**Criterios de aceptación**

* El tablero muestra cada postulación con empresa, oferta, fecha y estado: enviada, en revisión, descartada o aceptada.  
* El estudiante recibe una notificación (en plataforma y por correo) cada vez que cambia el estado de una postulación.  
* El estado "descartada" puede incluir un mensaje opcional de la empresa.

## **HU-13 Alertas automáticas de ofertas compatibles**

**Prioridad:** Media  
Como estudiante activo en la plataforma, quiero recibir alertas cuando aparezca una oferta compatible con mi perfil, para no perder oportunidades por no revisar el catálogo todos los días.

**Criterios de aceptación**

* El sistema envía notificación por correo y en plataforma cuando se publica una oferta con compatibilidad superior al 70 %.  
* El estudiante puede configurar la frecuencia de alertas (inmediata, diaria o semanal).  
* La alerta incluye nombre de la empresa, título del puesto y porcentaje de compatibilidad.  
* Las alertas de empresas seguidas tienen prioridad visual (marcadas en el feed con ícono de estrella).

## **HU-14 Registro y verificación legal de empresa** 

**Prioridad:** Alta  
Como responsable de RRHH de una empresa, quiero registrar a mi organización en la plataforma con nuestros datos legales, para publicar ofertas de prácticas de forma verificada y generar confianza en los candidatos.  
**Criterios de aceptación**

* El formulario solicita RUC o NIT, razón social, sector, tamaño de empresa y datos del responsable.  
* El sistema valida el RUC/NIT contra registros públicos o marca la cuenta como "pendiente de verificación".  
* La empresa recibe confirmación por correo en menos de 24 horas tras el registro.  
* Hasta que la verificación esté completa, la empresa puede preparar ofertas pero no publicarlas.

## **HU-15 Personalización del perfil de empresa**  

**Prioridad:** Baja  
Como empresa verificada, quiero personalizar mi página de perfil con descripción, cultura y logotipo, para atraer candidatos que se identifiquen con los valores de nuestra organización.  
**Criterios de aceptación**

* El perfil admite texto libre de hasta 500 caracteres, imagen de logotipo y hasta 3 etiquetas de cultura (ej. "trabajo remoto", "mentorías", "equipo joven").  
* El perfil es visible para los estudiantes desde la página de detalle de cada oferta.

## **HU-16 Publicación de ofertas de prácticas**  

**Prioridad:** Alta  
Como empresa verificada, quiero publicar una oferta de práctica con todos sus requisitos, para recibir postulaciones de candidatos que cumplan el perfil que busco.  
**Criterios de aceptación**

* El formulario incluye: título, área, carrera(s) afines, requisitos, modalidad, duración, compensación y fecha límite.  
* La oferta queda en estado "pendiente de revisión" hasta que el administrador la aprueba.  
* Al ser aprobada, la oferta es inmediatamente visible en el catálogo y el motor de recomendación la indexa.  
* La empresa recibe notificación cuando la oferta es aprobada o rechazada, con motivo en caso de rechazo.

## **HU-17 Gestión de candidatos y estados de postulación** 

**Prioridad:** Alta  
Como empresa con ofertas activas, quiero gestionar las postulaciones de cada oferta y cambiar su estado, para llevar un proceso de selección ordenado dentro de la plataforma.  
**Criterios de aceptación**

* La empresa ve la lista de postulantes por oferta con nombre, carrera, universidad y puntuación de compatibilidad.  
* Puede cambiar el estado de cada postulación: en revisión, descartado o seleccionado.  
* Al cambiar el estado de una postulación, la empresa puede adjuntar un mensaje personalizado que se envía junto con la notificación automática al candidato.  
* La empresa puede dejar comentarios internos sobre cada candidato, visibles solo para su equipo.

## **HU-18 Invitación directa a postular vía mensaje** 

**Prioridad:** Media  
Como reclutador que encontró un perfil de interés, quiero invitar al candidato a través del sistema de mensajería directa, para que la invitación llegue como un mensaje personalizado y no solo como una notificación genérica.  
**Criterios de aceptación**

* La invitación a postular se envía desde el inbox de mensajería directa, no solo como notificación del sistema.  
* El reclutador puede escribir un mensaje introductorio personalizado de hasta 300 caracteres junto con el enlace a la oferta.  
* El candidato puede aceptar o declinar la invitación directamente desde el mensaje, lo que registra su decisión sin necesidad de visitar la oferta.

## **HU-19 Moderación y aprobación de ofertas (Admin)** 

**Prioridad:** Alta  
Como administrador de PracHub, quiero revisar y aprobar las ofertas antes de que sean públicas, para garantizar que todas las prácticas publicadas sean legítimas y cumplan los estándares de la plataforma.  
**Criterios de aceptación**

* El administrador ve una cola de ofertas pendientes con empresa, puesto y fecha de envío.  
* Puede aprobar con un clic o rechazar con un motivo escrito que se notifica a la empresa.  
* El tiempo máximo de revisión es de 48 horas; pasado ese plazo el sistema envía un aviso interno.

## **HU-20 Generación de reportes de actividad (Admin)**

**Prioridad:** Media  
Como administrador, quiero generar reportes de actividad de la plataforma, para medir el impacto del sistema y tomar decisiones de mejora basadas en datos.  
**Criterios de aceptación**

* El reporte incluye: usuarios activos por semana, postulaciones totales, tasa de contratación y módulos más utilizados.  
* Los reportes pueden filtrarse por rango de fechas y exportarse en CSV.  
* El dashboard de administrador muestra las métricas clave en tiempo real.

## **HU-21 Seguimiento de empresas favoritas**  

**Prioridad:** Alta  
Como estudiante interesado en una empresa específica, quiero seguirla con un clic desde su perfil o desde una oferta, para recibir sus nuevas publicaciones sin tener que revisar el catálogo manualmente.  
**Criterios de aceptación**

* El botón "Seguir" está visible en el perfil de la empresa y en la cabecera de cada oferta publicada por ella.  
* Al seguir una empresa, el estado del botón cambia a "Siguiendo" con opción de dejar de seguir.  
* El estudiante accede a una sección "Empresas que sigo" desde su dashboard con el listado y número de ofertas activas de cada una.  
* Dejar de seguir una empresa elimina las alertas asociadas a ella sin afectar postulaciones ya enviadas.

## **HU-22 Feed personalizado de empresas seguidas**  

**Prioridad:** Alta  
Como estudiante que sigue varias empresas, quiero ver un feed personalizado con sus nuevas ofertas, para tener en un solo lugar todas las oportunidades de las organizaciones que me interesan.  
**Criterios de aceptación**

* El feed muestra las ofertas de empresas seguidas ordenadas por fecha de publicación, más recientes primero.  
* Cada tarjeta del feed indica cuánto tiempo lleva publicada la oferta y el porcentaje de compatibilidad con el perfil del estudiante.  
* Las ofertas ya postuladas aparecen marcadas para evitar duplicar acciones.  
* Si el estudiante no sigue ninguna empresa, el sistema muestra un mensaje con sugerencias de empresas afines a su carrera.

## **HU-23 Panel de métricas de seguidores para empresas**  

**Prioridad:** Media  
Como empresa con perfil en PracHub, quiero ver cuántos estudiantes me siguen y de qué carreras provienen, para entender mi alcance y ajustar el perfil de las prácticas que publico.  
**Criterios de aceptación**

* El panel de empresa muestra el total de seguidores y su distribución por carrera e universidad.  
* El dato se actualiza en tiempo real cada vez que un estudiante sigue o deja de seguir a la empresa.

## **HU-24 Envío de mensajes directos de reclutador a candidato**  

**Prioridad:** Alta  
Como reclutador de una empresa, quiero enviar un mensaje directo a un candidato desde su perfil, para contactarlo antes de que postule formalmente o para coordinar una entrevista.  
**Criterios de aceptación**

* El botón "Enviar mensaje" está disponible en el perfil del candidato y en la vista de postulaciones de una oferta.  
* El reclutador puede escribir un mensaje de hasta 500 caracteres y adjuntar hasta un archivo (PDF, máximo 5 MB).  
* El candidato recibe la notificación del mensaje en la plataforma y por correo electrónico.  
* El candidato puede responder al mensaje, iniciando un hilo de conversación.  
* Todos los mensajes quedan en el inbox del candidato organizados por empresa y fecha.  
* El reclutador solo puede iniciar conversación con candidatos que hayan postulado a una de sus ofertas o que aparezcan en resultados de búsqueda de candidatos. Previene spam masivo.

## **HU-25 Bandeja de entrada (Inbox) del estudiante**  

**Prioridad:** Alta  
Como estudiante con postulaciones activas, quiero recibir y responder mensajes de los reclutadores desde mi inbox en la plataforma, para gestionar toda la comunicación de mi proceso de selección en un solo lugar.  
**Criterios de aceptación**

* El inbox muestra todos los hilos de conversación ordenados por el más reciente con indicador de mensajes no leídos.  
* Cada hilo está etiquetado con el nombre de la empresa y la oferta relacionada (si existe).  
* El estudiante puede archivar o eliminar conversaciones sin afectar su postulación.  
* Si el estudiante no responde en 72 horas, el sistema le envía un recordatorio por correo.

## **HU-26 Mensajería directa entre estudiantes (Networking)**

**Prioridad:** Media  
Como estudiante de la plataforma, quiero enviar mensajes a otros estudiantes, para compartir experiencias, resolver dudas sobre procesos de selección o hacer networking entre pares.  
**Criterios de aceptación**

* El estudiante puede iniciar conversación con otro estudiante desde su perfil público.  
* Los mensajes entre estudiantes usan el mismo inbox pero se distinguen visualmente de los mensajes de empresa (con ícono de persona vs. ícono de empresa).  
* Cualquier usuario puede bloquear a otro, lo que impide recibir mensajes futuros de esa persona.  
* El sistema limita el envío a 10 mensajes iniciales por día para prevenir spam entre usuarios.

## **HU-27 Notificaciones transaccionales por correo electrónico**  

**Prioridad:** Alta  
Como estudiante con postulaciones enviadas, quiero recibir un correo electrónico transaccional cada vez que ocurra un evento relevante en mi proceso, para estar informado en tiempo real sin necesidad de entrar a la plataforma constantemente.  
**Criterios de aceptación**

* Se envían correos transaccionales para los siguientes eventos: registro exitoso, CV visto por una empresa, cambio de estado de postulación, nuevo mensaje recibido, nueva oferta compatible con el perfil, y nueva oferta publicada por una empresa seguida.  
* Cada correo incluye el nombre del remitente (ej. "PracHub · Empresa X revisó tu CV"), el detalle del evento y un botón de acción directo a la sección correspondiente de la plataforma.  
* El correo se envía en un máximo de 2 minutos tras el evento que lo origina.  
* El diseño del correo sigue una plantilla consistente con la marca de PracHub.

## **HU-28 Notificaciones prioritarias por WhatsApp**  

**Prioridad:** Alta  
Como estudiante activo en la búsqueda de prácticas, quiero recibir notificaciones por WhatsApp de los eventos más importantes, para enterarme al instante desde el canal que reviso con más frecuencia.  
**Criterios de aceptación**

* Durante el registro o en configuración, el estudiante puede vincular su número de WhatsApp para recibir notificaciones.  
* Los mensajes de WhatsApp se envían solo para eventos de alta prioridad: CV visto por empresa, cambio de estado de postulación y nuevo mensaje de reclutador.  
* El formato del mensaje es claro y conciso: "¡Hola \[nombre\]\! La empresa \[X\] revisó tu CV. Ingresa a PracHub para ver más detalles: \[enlace\]".  
* El estudiante puede desactivar las notificaciones de WhatsApp respondiendo "STOP" al número de la plataforma, sin afectar las notificaciones por correo.

## **HU-29 Panel de configuración de preferencias de notificaciones**  

**Prioridad:** Media  
Como estudiante registrado, quiero personalizar qué notificaciones recibo y por qué canal, para no saturarme de mensajes y enfocarme solo en los eventos que me importan.  
**Criterios de aceptación**

* La sección de configuración de notificaciones permite activar o desactivar cada tipo de evento por canal (plataforma, correo electrónico) de forma independiente.  
* El estudiante puede elegir la frecuencia de resúmenes: inmediata, diaria (un resumen consolidado) o semanal.  
* El canal "plataforma" (notificación interna) no puede desactivarse para eventos críticos como cambio de estado de postulación.