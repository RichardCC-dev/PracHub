const pdfService = require('../services/pdfService');
const { Resume } = require('../models');

class PDFController {
  async exportPDF(req, res) {
    try {
      console.log('📥 Controller recibido - req.body:', JSON.stringify(req.body, null, 2));
      const { templateId, style = 'classic' } = req.body;
      console.log('📋 Controller extraído - templateId:', templateId, 'style:', style);
      const userId = req.user.id; // Viene del middleware de autenticación (ID de la tabla Users)

      // Validar entrada
      if (!templateId) {
        return res.status(400).json({
          success: false,
          message: 'templateId es requerido'
        });
      }

      // Validar que templateId sea un número
      if (Number.isNaN(templateId)) {
        return res.status(400).json({
          success: false,
          message: 'templateId debe ser un número válido'
        });
      }

      // Validar estilo de plantilla
      const validStyles = ['classic', 'modern', 'creative'];
      if (!validStyles.includes(style)) {
        return res.status(400).json({
          success: false,
          message: 'Estilo de plantilla inválido. Opciones: classic, modern, creative'
        });
      }

      // Generar PDF
      const result = await pdfService.generatePDF(userId, Number.parseInt(templateId), style);

      res.json({
        success: true,
        message: 'PDF generado exitosamente',
        data: result
      });

    } catch (error) {
      console.error('Error en exportPDF:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error generando PDF'
      });
    }
  }

  async getTemplates(req, res) {
    try {
      const templates = await pdfService.getAvailableTemplates();

      res.json({
        success: true,
        data: templates
      });

    } catch (error) {
      console.error('Error en getTemplates:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error obteniendo plantillas'
      });
    }
  }

  async downloadPDF(req, res) {
    try {
      const userId = req.user.id;
      
      // Obtener el estudiante asociado al usuario
      const { Student } = require('../models');
      const student = await Student.findOne({ where: { userId } });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Perfil de estudiante no encontrado'
        });
      }
      
      // Obtener el CV más reciente del estudiante
      const resume = await Resume.findOne({ 
        where: { studentId: student.id },
        order: [['updated_at', 'DESC']]
      });

      if (!resume?.pdfUrl) {
        return res.status(404).json({
          success: false,
          message: 'PDF no encontrado. Genera un PDF primero.'
        });
      }

      // Construir la ruta completa al archivo
      const path = require('node:path');
      const filePath = path.join(__dirname, '../../public', resume.pdfUrl);

      // Verificar que el archivo exista
      if (!require('node:fs')?.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Archivo PDF no encontrado en el servidor'
        });
      }

      // Enviar el archivo
      res.download(filePath, (err) => {
        if (err) {
          console.error('Error descargando PDF:', err);
          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              message: 'Error descargando el archivo PDF'
            });
          }
        }
      });

    } catch (error) {
      console.error('Error en downloadPDF:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error descargando PDF'
      });
    }
  }

  async getStudentPDFs(req, res) {
    try {
      const userId = req.user.id;

      // Obtener el estudiante asociado al usuario
      const { Student } = require('../models');
      const student = await Student.findOne({ where: { userId } });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Perfil de estudiante no encontrado'
        });
      }

      // Obtener todos los PDFs del estudiante
      const resumes = await Resume.findAll({
        where: { 
          studentId: student.id,
          pdfUrl: { [require('sequelize').Op.ne]: null }
        },
        attributes: ['id', 'pdfUrl', 'templateId', 'updatedAt'],
        order: [['updatedAt', 'DESC']],
        limit: 10 // Limitar a los 10 más recientes
      });

      const pdfs = resumes.map(resume => ({
        id: resume.id,
        pdfUrl: resume.pdfUrl,
        templateId: resume.templateId,
        generatedAt: resume.updatedAt,
        fileName: resume.pdfUrl.split('/').pop()
      }));

      res.json({
        success: true,
        data: pdfs
      });

    } catch (error) {
      console.error('Error en getStudentPDFs:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error obteniendo PDFs del estudiante'
      });
    }
  }

}

module.exports = new PDFController();
