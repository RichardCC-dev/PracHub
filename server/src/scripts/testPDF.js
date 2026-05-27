const { CVTemplate, Resume, Student } = require('../models');
const pdfService = require('../services/pdfService');

const testPDFGeneration = async () => {
  try {
    console.log('🧪 Iniciando prueba de generación de PDF...');
    
    // 1. Obtener un estudiante de prueba
    const student = await Student.findOne();
    if (!student) {
      console.log('❌ No hay estudiantes en la base de datos');
      return;
    }
    console.log(`✅ Estudiante encontrado: ${student.firstName} ${student.lastName}`);
    
    // 2. Obtener el CV del estudiante
    const resume = await Resume.findOne({ where: { studentId: student.id } });
    if (!resume) {
      console.log('❌ El estudiante no tiene CV');
      return;
    }
    console.log('✅ CV encontrado');
    
    // 3. Obtener una plantilla
    const template = await CVTemplate.findOne({ where: { isActive: true } });
    if (!template) {
      console.log('❌ No hay plantillas activas');
      return;
    }
    console.log(`✅ Plantilla encontrada: ${template.name}`);
    
    // 4. Probar generación de HTML
    console.log('🔄 Generando HTML...');
    const html = pdfService.generateHTML(resume.content, template, student);
    console.log('✅ HTML generado correctamente');
    
    // 5. Probar generación de PDF
    console.log('🔄 Generando PDF...');
    const result = await pdfService.generatePDF(student.id, template.id);
    console.log('✅ PDF generado exitosamente:', result);
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Stack trace:', error.stack);
  }
};

testPDFGeneration();
