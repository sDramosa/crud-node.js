const mongoose = require('mongoose');

const conectarDB = async () => {
  try {
    // Intentamos conectar usando la variable de entorno
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Houston nos conectamos a la Base de datos exitosamente');
  } catch (error) {
    console.error('Houston tenemos un error al conectar a la base de datos:', error.message);
    process.exit(1); // Detiene la aplicación si hay error crítico
  }
};

module.exports = conectarDB;