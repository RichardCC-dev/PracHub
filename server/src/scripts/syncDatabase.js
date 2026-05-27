const { sequelize } = require('../models');
const seedCVTemplates = require('../seeds/cvTemplates');

const syncDatabase = async () => {
  try {
    console.log('🔄 Sincronizando base de datos...');
    
    // Sincronizar todos los modelos
    await sequelize.sync({ alter: true });
    console.log('✅ Base de datos sincronizada');
    
    // Poblar plantillas de CV
    console.log('🌱 Poblando plantillas de CV...');
    await seedCVTemplates();
    
    console.log('🎉 Base de datos lista para usar');
    
  } catch (error) {
    console.error('❌ Error sincronizando base de datos:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  syncDatabase();
}

module.exports = syncDatabase;
