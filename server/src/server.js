require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    // Usar sync sin alter para evitar error de demasiados índices en campos JSON
    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(`PracHub API listening on port ${PORT}`);
      console.log('✅ Base de datos sincronizada correctamente');
    });
  } catch (error) {
    console.error('Unable to start PracHub API:', error.message);
    process.exit(1);
  }
};

startServer();
