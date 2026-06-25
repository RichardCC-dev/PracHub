/**
 * seedFullDemo.js — Poblado integral de datos de prueba para PracHub
 * ------------------------------------------------------------------
 * Crea datos de demostración para probar las funcionalidades automatizables
 * de cada tipo de usuario (admin, empresa, estudiante) y registra TODO lo
 * creado en un archivo markdown (server/scripts/SEED_DEMO_DATA.md) para no
 * perder la información (credenciales, IDs, relaciones).
 *
 * Cubre (automatizable):
 *  - Admin (moderación de ofertas / verificación de empresas)
 *  - Empresas verificadas y pendientes de verificación
 *  - Estudiantes con perfil, CV (Resume), versiones de CV y configuración de alertas
 *  - Ofertas en distintos estados (approved / pending / rejected / closed)
 *  - Postulaciones (Application) en todos sus estados
 *  - Empresas seguidas (SavedCompany)
 *  - Notificaciones
 *  - Mensajes directos (DirectMessage) e invitaciones a postular (InvitationToApply)
 *  - Análisis de CV (CVAnalysis) y simulaciones de entrevista (Simulation)
 *
 * NO automatizable (debe hacerse manualmente en el sistema):
 *  - Subida/Export real de PDF del CV (Puppeteer en runtime)
 *  - Flujos de IA en vivo (Gemini) para análisis/simulación reales
 *  - Verificación de email vía token enviado por correo
 *  - Reset de contraseña vía correo
 *
 * Uso:
 *   cd server
 *   node scripts/seedFullDemo.js
 *
 * Idempotente: usa email/identificadores únicos; si ya existe, lo reutiliza.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const fs = require('fs');
const bcrypt = require('bcryptjs');
const {
  sequelize,
  User,
  Student,
  Company,
  Resume,
  ResumeVersion,
  Offer,
  Application,
  AlertSettings,
  SavedCompany,
  Notification,
  DirectMessage,
  InvitationToApply,
  CVAnalysis,
  Simulation,
} = require('../src/models');

const DEFAULT_PASSWORD = 'Demo1234!';
const report = [];
const log = (msg) => {
  console.log(msg);
};

/** Crea o reutiliza un usuario por email. */
async function ensureUser(email, role, passwordHash) {
  let user = await User.findOne({ where: { email } });
  if (!user) {
    user = await User.create({
      email,
      passwordHash,
      role,
      authProvider: 'local',
      isEmailVerified: true,
    });
    log(`  + Usuario ${role} creado: ${email} (id=${user.id})`);
  } else {
    log(`  = Usuario ${role} existente: ${email} (id=${user.id})`);
  }
  return user;
}

async function main() {
  await sequelize.authenticate();
  log('\n🟢 Conectado a la base de datos.\n');

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  // ============================================================
  // 1. ADMIN
  // ============================================================
  log('1️⃣  Admin...');
  const adminUser = await ensureUser('admin.demo@prachub.local', 'admin', passwordHash);

  // ============================================================
  // 2. EMPRESAS
  // ============================================================
  log('\n2️⃣  Empresas...');
  const companiesSeed = [
    {
      email: 'empresa.verificada@prachub.local',
      taxId: '20100000001',
      legalName: 'TechNova Solutions SAC',
      tradeName: 'TechNova',
      description: 'Desarrollo de software, plataformas web y soluciones cloud.',
      industry: 'Tecnología',
      companySize: 'medium',
      responsibleName: 'María García',
      responsiblePosition: 'Gerente de RRHH',
      responsiblePhone: '999888777',
      city: 'Lima',
      address: 'Av. Arequipa 1234, Miraflores',
      cultureTags: ['Innovación', 'Trabajo en equipo', 'Flexibilidad'],
      verificationStatus: 'verified',
      isVerified: true,
      verifiedAt: new Date(),
      canPublishOffers: true,
    },
    {
      email: 'empresa.datos@prachub.local',
      taxId: '20100000002',
      legalName: 'DataPeru Analytics EIRL',
      tradeName: 'DataPeru',
      description: 'Consultoría en ciencia de datos e inteligencia artificial.',
      industry: 'Consultoría',
      companySize: 'small',
      responsibleName: 'Carlos Rojas',
      responsiblePosition: 'CTO',
      responsiblePhone: '988777666',
      city: 'Arequipa',
      address: 'Calle Mercaderes 200',
      cultureTags: ['Aprendizaje continuo', 'Datos'],
      verificationStatus: 'verified',
      isVerified: true,
      verifiedAt: new Date(),
      canPublishOffers: true,
    },
    {
      email: 'empresa.pendiente@prachub.local',
      taxId: '20100000003',
      legalName: 'StartUp Naciente SAC',
      tradeName: 'Naciente',
      description: 'Startup en etapa temprana, pendiente de verificación por admin.',
      industry: 'Tecnología',
      companySize: 'micro',
      responsibleName: 'Lucía Fernández',
      responsiblePosition: 'Fundadora',
      responsiblePhone: '977666555',
      city: 'Lima',
      address: 'Jr. de la Unión 500',
      cultureTags: ['Agilidad'],
      verificationStatus: 'pending',
      isVerified: false,
      canPublishOffers: false,
    },
  ];

  const companies = [];
  for (const c of companiesSeed) {
    const user = await ensureUser(c.email, 'company', passwordHash);
    let company = await Company.findOne({ where: { userId: user.id } });
    const { email, ...companyData } = c;
    if (!company) {
      company = await Company.create({ userId: user.id, ...companyData });
      log(`  + Empresa creada: ${company.legalName} (id=${company.id})`);
    } else {
      await company.update(companyData);
      log(`  = Empresa existente: ${company.legalName} (id=${company.id})`);
    }
    companies.push({ user, company, email });
  }

  // ============================================================
  // 3. ESTUDIANTES
  // ============================================================
  log('\n3️⃣  Estudiantes...');
  const studentsSeed = [
    {
      email: 'estudiante.dev@prachub.local',
      firstName: 'Juan',
      lastName: 'Pérez',
      university: 'Universidad Nacional Mayor de San Marcos',
      career: 'Ingeniería de Software',
      cycle: '8vo',
      availability: 'Tiempo completo',
      bio: 'Desarrollador fullstack: React, Node.js, Python, MySQL.',
      phoneNumber: '987654321',
      skillsText: 'React JavaScript HTML CSS Node.js Express Python MySQL Git Docker',
      summary: 'Desarrollador fullstack con experiencia en React, Node.js y Python.',
    },
    {
      email: 'estudiante.data@prachub.local',
      firstName: 'Ana',
      lastName: 'Torres',
      university: 'Pontificia Universidad Católica del Perú',
      career: 'Ciencias de la Computación',
      cycle: '9no',
      availability: 'Medio tiempo',
      bio: 'Apasionada por ciencia de datos, Python y machine learning.',
      phoneNumber: '986543210',
      skillsText: 'Python Pandas Numpy Scikit-learn NLP Machine Learning SQL TensorFlow',
      summary: 'Estudiante de Ciencias de la Computación enfocada en data science e IA.',
    },
    {
      email: 'estudiante.design@prachub.local',
      firstName: 'Diego',
      lastName: 'Ramírez',
      university: 'Universidad de Lima',
      career: 'Diseño UX/UI',
      cycle: '7mo',
      availability: 'Tiempo completo',
      bio: 'Diseñador UX/UI con manejo de Figma y prototipado.',
      phoneNumber: '985432109',
      skillsText: 'Figma Adobe XD UX UI Prototipado Diseño Wireframes Usabilidad',
      summary: 'Diseñador UX/UI centrado en el usuario y prototipado interactivo.',
    },
  ];

  const students = [];
  for (const s of studentsSeed) {
    const user = await ensureUser(s.email, 'student', passwordHash);
    let student = await Student.findOne({ where: { userId: user.id } });
    if (!student) {
      student = await Student.create({
        userId: user.id,
        firstName: s.firstName,
        lastName: s.lastName,
        university: s.university,
        career: s.career,
        cycle: s.cycle,
        availability: s.availability,
        bio: s.bio,
        phoneNumber: s.phoneNumber,
      });
      log(`  + Estudiante creado: ${s.firstName} ${s.lastName} (id=${student.id})`);
    } else {
      log(`  = Estudiante existente: ${s.firstName} ${s.lastName} (id=${student.id})`);
    }

    // Resume (CV)
    let resume = await Resume.findOne({ where: { studentId: student.id } });
    const resumePayload = {
      profile: { summary: s.summary },
      personal: { firstName: s.firstName, lastName: s.lastName, phone: s.phoneNumber, email: s.email },
      education: { items: [{ degree: s.career, institution: s.university, fieldOfStudy: s.career }] },
      experience: { items: [{ role: 'Practicante', company: 'Proyecto académico', description: s.bio }] },
      skills: { areas: [{ area: 'Técnicas', skills: s.skillsText }], soft: 'Trabajo en equipo, comunicación, proactividad' },
      languages: { list: 'Español nativo, Inglés intermedio' },
      projects: { items: [{ title: 'Proyecto destacado', description: s.bio }] },
      certifications: { items: [{ name: 'Certificación profesional', issuer: 'Plataforma online' }] },
      completionPercentage: 90,
    };
    if (!resume) {
      resume = await Resume.create({ studentId: student.id, ...resumePayload });
      log(`    + Resume creado (id=${resume.id})`);
    } else {
      log(`    = Resume existente (id=${resume.id})`);
    }

    // ResumeVersion (versión guardada)
    let version = await ResumeVersion.findOne({ where: { studentId: student.id } });
    if (!version) {
      version = await ResumeVersion.create({
        studentId: student.id,
        title: 'CV principal',
        ...resumePayload,
        template: 'modern',
      });
      log(`    + ResumeVersion creada (id=${version.id})`);
    } else {
      log(`    = ResumeVersion existente (id=${version.id})`);
    }

    // AlertSettings
    let alert = await AlertSettings.findOne({ where: { studentId: student.id } });
    if (!alert) {
      alert = await AlertSettings.create({
        studentId: student.id,
        frequency: 'daily',
        emailEnabled: true,
        platformEnabled: true,
        whatsappEnabled: false,
      });
      log(`    + AlertSettings creadas (id=${alert.id})`);
    }

    students.push({ user, student, resume, version, ...s });
  }

  // ============================================================
  // 4. OFERTAS (varios estados)
  // ============================================================
  log('\n4️⃣  Ofertas...');
  const techNova = companies[0].company;
  const dataPeru = companies[1].company;
  const naciente = companies[2].company;

  const offersSeed = [
    {
      companyId: techNova.id,
      title: 'Practicante Desarrollo Web Fullstack (React/Node.js)',
      description: 'Prácticas en desarrollo web fullstack con React, Node.js, MySQL y APIs REST.',
      requirements: '- React, JavaScript, HTML, CSS\n- Node.js, Express, MySQL\n- Trabajo en equipo',
      area: 'Desarrollo Web',
      careerTags: ['Ingeniería de Software', 'Ciencias de la Computación'],
      modality: 'remote',
      duration: '6 meses',
      compensation: 'S/ 1,500 mensual',
      status: 'approved',
      moderatedBy: adminUser.id,
      moderatedAt: new Date(),
    },
    {
      companyId: dataPeru.id,
      title: 'Practicante de Ciencia de Datos e IA',
      description: 'Limpieza de datos, entrenamiento de modelos ML y visualización.',
      requirements: '- Python (Pandas, Numpy, Scikit-learn)\n- NLP\n- Inglés técnico',
      area: 'Data Science',
      careerTags: ['Ciencias de la Computación', 'Ingeniería de Sistemas'],
      modality: 'hybrid',
      duration: '6 meses',
      compensation: 'S/ 1,600 mensual',
      status: 'approved',
      moderatedBy: adminUser.id,
      moderatedAt: new Date(),
    },
    {
      companyId: techNova.id,
      title: 'Practicante Diseño UX/UI',
      description: 'Rediseño de aplicaciones móviles y web. Figma y prototipado.',
      requirements: '- Figma o Adobe XD\n- Diseño centrado en el usuario\n- Portafolio',
      area: 'Diseño',
      careerTags: ['Diseño UX/UI', 'Diseño Gráfico'],
      modality: 'remote',
      duration: '3 meses',
      compensation: 'S/ 1,200 mensual',
      status: 'approved',
      moderatedBy: adminUser.id,
      moderatedAt: new Date(),
    },
    {
      companyId: dataPeru.id,
      title: 'Practicante Backend Python (pendiente moderación)',
      description: 'Oferta en espera de aprobación del administrador.',
      requirements: '- Python, Django\n- PostgreSQL',
      area: 'Backend',
      careerTags: ['Ingeniería de Software'],
      modality: 'in_person',
      duration: '6 meses',
      compensation: 'S/ 1,400 mensual',
      status: 'pending',
    },
    {
      companyId: techNova.id,
      title: 'Practicante QA (rechazada)',
      description: 'Oferta de ejemplo rechazada por el administrador.',
      requirements: '- Testing manual',
      area: 'QA',
      careerTags: ['Ingeniería de Software'],
      modality: 'remote',
      duration: '4 meses',
      compensation: 'S/ 1,100 mensual',
      status: 'rejected',
      moderatedBy: adminUser.id,
      moderatedAt: new Date(),
      rejectionReason: 'Descripción insuficiente. Completar requisitos y funciones del puesto.',
    },
  ];

  const offers = [];
  for (const o of offersSeed) {
    let offer = await Offer.findOne({ where: { companyId: o.companyId, title: o.title } });
    if (!offer) {
      offer = await Offer.create(o);
      log(`  + Oferta creada: "${o.title}" [${o.status}] (id=${offer.id})`);
    } else {
      log(`  = Oferta existente: "${o.title}" (id=${offer.id})`);
    }
    offers.push(offer);
  }

  // ============================================================
  // 5. POSTULACIONES (todos los estados)
  // ============================================================
  log('\n5️⃣  Postulaciones...');
  const juan = students[0];
  const ana = students[1];
  const diego = students[2];

  const applicationsSeed = [
    { student: juan, offer: offers[0], status: 'enviada' },
    { student: ana, offer: offers[1], status: 'revision', companyNotes: 'Buen perfil técnico, agendar entrevista.' },
    { student: diego, offer: offers[2], status: 'aceptada', companyNotes: 'Portafolio excelente.' },
    { student: ana, offer: offers[0], status: 'descartada', companyNotes: 'No cumple disponibilidad requerida.' },
  ];

  const applications = [];
  for (const a of applicationsSeed) {
    let app = await Application.findOne({ where: { studentId: a.student.student.id, offerId: a.offer.id } });
    if (!app) {
      app = await Application.create({
        studentId: a.student.student.id,
        offerId: a.offer.id,
        resumeId: a.student.resume.id,
        resumeVersionId: a.student.version.id,
        status: a.status,
        companyNotes: a.companyNotes || null,
        companyResponseAt: a.status === 'enviada' ? null : new Date(),
      });
      log(`  + Postulación: ${a.student.firstName} → "${a.offer.title}" [${a.status}] (id=${app.id})`);
    } else {
      log(`  = Postulación existente (id=${app.id})`);
    }
    applications.push(app);
  }

  // ============================================================
  // 6. EMPRESAS SEGUIDAS (SavedCompany)
  // ============================================================
  log('\n6️⃣  Empresas seguidas...');
  const followsSeed = [
    { student: juan, company: techNova },
    { student: juan, company: dataPeru },
    { student: ana, company: dataPeru },
    { student: diego, company: techNova },
  ];
  for (const f of followsSeed) {
    const [row, created] = await SavedCompany.findOrCreate({
      where: { studentId: f.student.student.id, companyId: f.company.id },
      defaults: { studentId: f.student.student.id, companyId: f.company.id, notificationsEnabled: true },
    });
    log(`  ${created ? '+' : '='} ${f.student.firstName} sigue a ${f.company.tradeName} (id=${row.id})`);
  }

  // ============================================================
  // 7. NOTIFICACIONES
  // ============================================================
  log('\n7️⃣  Notificaciones...');
  const notificationsSeed = [
    { userId: juan.user.id, type: 'offer_match', title: 'Nueva oferta compatible', message: 'Hay una oferta de Desarrollo Web que coincide con tu perfil.', relatedId: offers[0].id },
    { userId: ana.user.id, type: 'status_change', title: 'Tu postulación pasó a revisión', message: 'DataPeru está revisando tu postulación.', relatedId: applications[1].id },
    { userId: diego.user.id, type: 'status_change', title: '¡Postulación aceptada!', message: 'TechNova aceptó tu postulación a UX/UI.', relatedId: applications[2].id },
    { userId: companies[0].user.id, type: 'application_received', title: 'Nueva postulación', message: 'Recibiste una postulación a tu oferta de Desarrollo Web.', relatedId: applications[0].id },
    { userId: companies[2].user.id, type: 'offer_rejected', title: 'Oferta rechazada', message: 'Tu oferta de QA fue rechazada por el administrador.', relatedId: offers[4].id },
    { userId: juan.user.id, type: 'followed_company_offer', title: 'Nueva oferta de empresa seguida', message: 'TechNova publicó una nueva oferta.', relatedId: offers[2].id },
  ];
  for (const n of notificationsSeed) {
    const exists = await Notification.findOne({ where: { userId: n.userId, type: n.type, title: n.title } });
    if (!exists) {
      await Notification.create(n);
      log(`  + Notificación [${n.type}] → userId=${n.userId}`);
    } else {
      log(`  = Notificación existente [${n.type}] → userId=${n.userId}`);
    }
  }

  // ============================================================
  // 8. MENSAJES DIRECTOS + INVITACIÓN A POSTULAR
  // ============================================================
  log('\n8️⃣  Mensajes directos e invitaciones...');
  // company → student
  let dm = await DirectMessage.findOne({ where: { senderId: companies[0].user.id, receiverId: juan.user.id } });
  if (!dm) {
    dm = await DirectMessage.create({
      senderId: companies[0].user.id,
      receiverId: juan.user.id,
      content: 'Hola Juan, vimos tu perfil y nos gustaría invitarte a postular a nuestra oferta de Desarrollo Web.',
      isRead: false,
    });
    log(`  + Mensaje empresa→estudiante (id=${dm.id})`);
  } else {
    log(`  = Mensaje existente (id=${dm.id})`);
  }
  // student → company (respuesta)
  const reply = await DirectMessage.findOne({ where: { senderId: juan.user.id, receiverId: companies[0].user.id } });
  if (!reply) {
    const r = await DirectMessage.create({
      senderId: juan.user.id,
      receiverId: companies[0].user.id,
      content: '¡Hola! Gracias por contactarme, me interesa mucho la oferta.',
      isRead: true,
    });
    log(`  + Respuesta estudiante→empresa (id=${r.id})`);
  }
  // InvitationToApply vinculada al mensaje company→student
  let invitation = await InvitationToApply.findOne({ where: { messageId: dm.id, offerId: offers[0].id } });
  if (!invitation) {
    invitation = await InvitationToApply.create({
      messageId: dm.id,
      offerId: offers[0].id,
      studentId: juan.student.id,
      recruiterMessage: 'Nos encantaría que postules a esta oferta.',
      responseStatus: 'PENDING',
    });
    log(`  + Invitación a postular creada (id=${invitation.id})`);
  } else {
    log(`  = Invitación existente (id=${invitation.id})`);
  }

  // ============================================================
  // 9. ANÁLISIS DE CV (CVAnalysis)
  // ============================================================
  log('\n9️⃣  Análisis de CV...');
  const cvaExists = await CVAnalysis.findOne({ where: { studentId: juan.student.id, offerId: offers[0].id } });
  if (!cvaExists) {
    await CVAnalysis.create({
      studentId: juan.student.id,
      resumeId: juan.resume.id,
      offerId: offers[0].id,
      overallScore: 82,
      sectionScores: { experiencia: 80, educacion: 85, habilidades: 88, proyectos: 75 },
      observations: ['Buen dominio de stack fullstack', 'Falta cuantificar logros'],
      recommendations: ['Agregar métricas a los proyectos', 'Incluir certificaciones cloud'],
      keywordsAnalysis: { matched: ['React', 'Node.js', 'MySQL'], missing: ['Docker', 'AWS'] },
    });
    log(`  + Análisis de CV creado para Juan (oferta Desarrollo Web)`);
  } else {
    log(`  = Análisis de CV existente`);
  }

  // ============================================================
  // 10. SIMULACIÓN DE ENTREVISTA (Simulation)
  // ============================================================
  log('\n🔟 Simulaciones de entrevista...');
  const simExists = await Simulation.findOne({ where: { studentId: ana.student.id } });
  if (!simExists) {
    await Simulation.create({
      studentId: ana.student.id,
      simulatedRole: 'Practicante de Ciencia de Datos',
      career: ana.career,
      sector: 'Tecnología',
      overallScore: 78,
      aiFeedbackSummary: 'Buenas respuestas técnicas. Mejorar ejemplos de trabajo en equipo.',
      status: 'completed',
      chatHistory: [
        { role: 'ai', content: '¿Cuéntame sobre un proyecto de datos en el que hayas trabajado?' },
        { role: 'user', content: 'Trabajé en un clasificador de texto con scikit-learn...' },
      ],
    });
    log(`  + Simulación creada para Ana`);
  } else {
    log(`  = Simulación existente`);
  }

  // ============================================================
  // GENERAR REPORTE MARKDOWN
  // ============================================================
  await writeReport({ adminUser, companies, students, offers, applications });

  log('\n✅ Seed completado. Reporte: server/scripts/SEED_DEMO_DATA.md\n');
  await sequelize.close();
}

async function writeReport({ adminUser, companies, students, offers, applications }) {
  const lines = [];
  const now = new Date().toISOString();
  lines.push('# PracHub — Datos de demostración (seed)');
  lines.push('');
  lines.push(`> Generado automáticamente por \`server/scripts/seedFullDemo.js\` el ${now}.`);
  lines.push('');
  lines.push(`**Contraseña común para TODOS los usuarios:** \`${DEFAULT_PASSWORD}\``);
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## 1. Administrador');
  lines.push('');
  lines.push('| Rol | Email | Password | userId |');
  lines.push('|-----|-------|----------|--------|');
  lines.push(`| admin | ${adminUser.email} | ${DEFAULT_PASSWORD} | ${adminUser.id} |`);
  lines.push('');

  lines.push('## 2. Empresas');
  lines.push('');
  lines.push('| Email | Razón social | Estado verif. | Puede publicar | userId | companyId |');
  lines.push('|-------|--------------|---------------|----------------|--------|-----------|');
  for (const c of companies) {
    lines.push(`| ${c.email} | ${c.company.legalName} | ${c.company.verificationStatus} | ${c.company.canPublishOffers ? 'Sí' : 'No'} | ${c.user.id} | ${c.company.id} |`);
  }
  lines.push('');

  lines.push('## 3. Estudiantes');
  lines.push('');
  lines.push('| Email | Nombre | Carrera | userId | studentId | resumeId |');
  lines.push('|-------|--------|---------|--------|-----------|----------|');
  for (const s of students) {
    lines.push(`| ${s.email} | ${s.firstName} ${s.lastName} | ${s.career} | ${s.user.id} | ${s.student.id} | ${s.resume.id} |`);
  }
  lines.push('');

  lines.push('## 4. Ofertas');
  lines.push('');
  lines.push('| offerId | Título | Empresa (companyId) | Estado | Modalidad |');
  lines.push('|---------|--------|---------------------|--------|-----------|');
  for (const o of offers) {
    lines.push(`| ${o.id} | ${o.title} | ${o.companyId} | ${o.status} | ${o.modality} |`);
  }
  lines.push('');

  lines.push('## 5. Postulaciones');
  lines.push('');
  lines.push('| applicationId | studentId | offerId | Estado |');
  lines.push('|---------------|-----------|---------|--------|');
  for (const a of applications) {
    lines.push(`| ${a.id} | ${a.studentId} | ${a.offerId} | ${a.status} |`);
  }
  lines.push('');

  lines.push('## 6. Otros datos creados');
  lines.push('');
  lines.push('- **Empresas seguidas (SavedCompany):** relaciones estudiante↔empresa para probar el feed de empresas seguidas.');
  lines.push('- **Notificaciones:** ejemplos de cada tipo relevante (offer_match, status_change, application_received, offer_rejected, followed_company_offer).');
  lines.push('- **Mensajes directos:** hilo empresa↔estudiante (HU-24/25).');
  lines.push('- **Invitación a postular (InvitationToApply):** en estado PENDING para probar aceptar/declinar.');
  lines.push('- **Análisis de CV (CVAnalysis):** ejemplo con score y keywords para el estudiante Juan.');
  lines.push('- **Simulación de entrevista (Simulation):** ejemplo completado para la estudiante Ana.');
  lines.push('- **AlertSettings:** configuradas para cada estudiante.');
  lines.push('- **ResumeVersion:** una versión guardada por estudiante.');
  lines.push('');

  lines.push('## 7. Qué probar por tipo de usuario');
  lines.push('');
  lines.push('### Admin');
  lines.push('- Verificar/rechazar la empresa **StartUp Naciente** (pending).');
  lines.push('- Aprobar la oferta **Practicante Backend Python** (pending) y revisar la rechazada de QA.');
  lines.push('- Revisar dashboard de reportes/métricas.');
  lines.push('');
  lines.push('### Empresa');
  lines.push('- Iniciar sesión con `empresa.verificada@prachub.local` y gestionar ofertas/candidatos.');
  lines.push('- Revisar postulaciones recibidas y cambiar su estado.');
  lines.push('- Enviar mensajes/invitaciones a candidatos.');
  lines.push('- Con `empresa.pendiente@prachub.local` comprobar que NO puede publicar ofertas.');
  lines.push('');
  lines.push('### Estudiante');
  lines.push('- Iniciar sesión con `estudiante.dev@prachub.local` y ver recomendaciones/ofertas.');
  lines.push('- Postular a ofertas, ver estado de postulaciones y notificaciones.');
  lines.push('- Seguir empresas y revisar el feed.');
  lines.push('- Responder la invitación a postular (aceptar/declinar).');
  lines.push('- Editar el CV y guardar versiones.');
  lines.push('');

  lines.push('## 8. Acciones NO automatizadas (hacer manualmente en el sistema)');
  lines.push('');
  lines.push('- Registro de nuevos usuarios vía formulario + verificación de email por token.');
  lines.push('- Recuperación de contraseña vía correo.');
  lines.push('- Export/descarga real del CV en PDF (Puppeteer en runtime).');
  lines.push('- Análisis de CV y simulación de entrevista con IA en vivo (Gemini): los registros sembrados son ejemplos estáticos.');
  lines.push('- Subida de logo de empresa / foto de perfil (archivos reales).');
  lines.push('');

  const outPath = path.resolve(__dirname, 'SEED_DEMO_DATA.md');
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  log(`  📝 Reporte escrito en ${outPath}`);
}

main().catch((err) => {
  console.error('\n❌ Error en el seed:', err);
  process.exit(1);
});
