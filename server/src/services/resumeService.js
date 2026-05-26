const { Resume, Student, sequelize } = require('../models');
const { improveText, improveSection } = require('./aiService');

const calculateCompletion = (resume) => {
  const fields = [
    resume.personal?.fullName,
    resume.personal?.email,
    resume.personal?.phone,
    resume.personal?.linkedin,
    resume.education?.degree,
    resume.education?.institution,
    resume.education?.startDate,
    resume.education?.endDate,
    resume.skills?.technical,
    resume.skills?.soft,
    resume.languages?.list,
  ];

  // Agregar campos de experiencia si hay items
  if (resume.experience?.items && Array.isArray(resume.experience.items)) {
    resume.experience.items.forEach((exp, index) => {
      fields.push(exp.company, exp.role, exp.description);
    });
  } else {
    // Si no hay items, agregar campos vacíos para mantener el conteo
    fields.push(null, null, null);
  }

  // Agregar campos de proyectos si hay items
  if (resume.projects?.items && Array.isArray(resume.projects.items)) {
    resume.projects.items.forEach((proj, index) => {
      fields.push(proj.title, proj.description);
    });
  } else {
    // Si no hay items, agregar campos vacíos para mantener el conteo
    fields.push(null, null);
  }

  const filled = fields.filter((field) => field && field.trim() !== '').length;
  return Math.round((filled / fields.length) * 100);
};

const getOrCreateResume = async (studentId) => {
  let resume = await Resume.findOne({ where: { studentId } });

  if (!resume) {
    resume = await Resume.create({
      studentId,
      personal: {},
      education: {},
      experience: {},
      skills: {},
      languages: {},
      projects: {},
      completionPercentage: 0,
    });
  }

  return resume;
};

const updateSection = async (studentId, section, data) => {
  const resume = await getOrCreateResume(studentId);

  resume[section] = { ...resume[section], ...data };
  resume.completionPercentage = calculateCompletion(resume);
  await resume.save();

  return resume;
};

const improveField = async (studentId, section, field) => {
  const resume = await getOrCreateResume(studentId);
  const content = resume[section]?.[field];

  if (!content || content.trim() === '') {
    throw new Error('El campo está vacío. Escribe algo antes de pedir una sugerencia.');
  }

  const improved = await improveText({ section, field, content });

  return { original: content, improved };
};

const improveFullSection = async (studentId, section) => {
  const resume = await getOrCreateResume(studentId);
  const data = resume[section] || {};

  let hasContent = false;
  
  // Para secciones con arrays (experience, projects)
  if (section === 'experience' || section === 'projects') {
    hasContent = data.items?.some(item => 
      Object.values(item).some(value => value?.trim())
    );
  } else {
    // Para secciones normales
    hasContent = Object.values(data).some(value => value && value.trim() !== '');
  }

  if (!hasContent) {
    throw new Error('La sección está vacía. Escribe algo antes de pedir una sugerencia.');
  }

  const improved = await improveSection({ section, data });

  return { original: data, improved };
};

const getResume = async (studentId) => {
  const resume = await getOrCreateResume(studentId);
  return resume;
};

module.exports = {
  getOrCreateResume,
  updateSection,
  improveField,
  improveFullSection,
  getResume,
};
