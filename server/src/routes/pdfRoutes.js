const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const authMiddleware = require('../middlewares/authMiddleware');

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

// Obtener plantillas disponibles
router.get('/templates', pdfController.getTemplates);

// Exportar CV a PDF
router.post('/export', pdfController.exportPDF);

// Descargar PDF más reciente
router.get('/download', pdfController.downloadPDF);

// Obtener historial de PDFs del estudiante
router.get('/history', pdfController.getStudentPDFs);

module.exports = router;
