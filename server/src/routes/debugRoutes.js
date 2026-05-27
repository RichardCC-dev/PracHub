const express = require('express');
const router = express.Router();
const { CVTemplate, Resume, Student } = require('../models');
const pdfService = require('../services/pdfService');

// Endpoint de prueba para depurar generación de PDF
router.post('/test-pdf', async (req, res) => {
  try {
    console.log('🧪 Iniciando prueba de generación de PDF...');
    
    // Obtener el estudiante autenticado
    const studentId = req.user.id;
    
    // 1. Obtener datos del estudiante
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado'
      });
    }
    console.log(`✅ Estudiante encontrado: ${student.firstName} ${student.lastName}`);
    
    // 2. Obtener el CV del estudiante
    const resume = await Resume.findOne({ where: { studentId } });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'El estudiante no tiene CV'
      });
    }
    console.log('✅ CV encontrado');
    
    // 3. Obtener una plantilla
    const template = await CVTemplate.findOne({ where: { isActive: true } });
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'No hay plantillas activas'
      });
    }
    console.log(`✅ Plantilla encontrada: ${template.name}`);
    
    // 4. Probar generación de HTML
    console.log('🔄 Generando HTML...');
    const html = pdfService.generateHTML(resume.content, template, student);
    console.log('✅ HTML generado correctamente');
    
    // 5. Probar generación de PDF
    console.log('🔄 Generando PDF...');
    const result = await pdfService.generatePDF(studentId, template.id);
    console.log('✅ PDF generado exitosamente:', result);
    
    res.json({
      success: true,
      message: 'PDF generado exitosamente',
      data: result
    });
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
