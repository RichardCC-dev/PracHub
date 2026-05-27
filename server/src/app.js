const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('node:path');
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const companyRoutes = require('./routes/companyRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const debugRoutes = require('./routes/debugRoutes');
const errorHandler = require('./middlewares/errorHandler');
const initTemplates = require('./scripts/initTemplates');

const app = express();

// Configurar helmet sin CORS restrictions para archivos estáticos
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({ 
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));

// Servir archivos estáticos (logos subidos) con CORS headers explícitos
app.use('/uploads', (req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../public/uploads')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'prachub-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/debug', debugRoutes);
app.use(errorHandler);

// Temporalmente deshabilitado para evitar error de índices
// Inicializar plantillas de CV si no existen
// initTemplates();

module.exports = app;
