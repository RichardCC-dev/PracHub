const { sequelize } = require('../models');
const initTemplates = require('./initTemplates');

const resetDatabase = async () => {
  try {
    console.log('🔄 Reiniciando base de datos...');
    
    // Forzar la sincronización eliminando todas las tablas
    await sequelize.sync({ force: true });
    console.log('✅ Base de datos reiniciada (todas las tablas eliminadas)');
    
    // Poblar plantillas de CV
    console.log('🌱 Poblando plantillas de CV...');
    await initTemplates();
    
    console.log('🎉 Base de datos lista para usar');
    
  } catch (error) {
    console.error('❌ Error reiniciando base de datos:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  resetDatabase();
}

module.exports = resetDatabase;
