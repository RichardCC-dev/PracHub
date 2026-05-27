const fs = require('node:fs').promises;
const path = require('node:path');
const { CVTemplate } = require('../models');

const seedCVTemplates = async () => {
  try {
    // Leer archivos de plantillas
    const modernTemplate = await fs.readFile(
      path.join(__dirname, '../templates/modern.html'), 
      'utf8'
    );
    const classicTemplate = await fs.readFile(
      path.join(__dirname, '../templates/classic.html'), 
      'utf8'
    );
    const creativeTemplate = await fs.readFile(
      path.join(__dirname, '../templates/creative.html'), 
      'utf8'
    );

    const templates = [
      {
        name: 'Moderna',
        description: 'Diseño limpio y profesional con gradientes modernos',
        category: 'modern',
        htmlTemplate: modernTemplate,
        cssStyles: null, // Estilos incluidos en el HTML
        thumbnailUrl: null,
        isActive: true,
      },
      {
        name: 'Clásica',
        description: 'Estilo tradicional y formal, ideal para sectores conservadores',
        category: 'classic',
        htmlTemplate: classicTemplate,
        cssStyles: null, // Estilos incluidos en el HTML
        thumbnailUrl: null,
        isActive: true,
      },
      {
        name: 'Creativa',
        description: 'Diseño vibrante con colores y elementos visuales atractivos',
        category: 'creative',
        htmlTemplate: creativeTemplate,
        cssStyles: null, // Estilos incluidos en el HTML
        thumbnailUrl: null,
        isActive: true,
      },
    ];

    // Insertar plantillas
    for (const template of templates) {
      await CVTemplate.findOrCreate({
        where: { name: template.name },
        defaults: template,
      });
    }

    console.log('✅ Plantillas de CV creadas exitosamente');
  } catch (error) {
    console.error('❌ Error creando plantillas de CV:', error);
  }
};

module.exports = seedCVTemplates;
