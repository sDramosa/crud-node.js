const express = require('express');
const cors = require('cors');
const conectarDB = require('./database/db');

// Primero cargamos las variables de entorno desde mi archivo .env
require('dotenv').config();

// Inicializar Express
const app = express();

// Los middlewares son funciones que se ejecutan antes de llegar a las rutas
// Se usan para procesar la información que llega al servidor

app.use(express.json()); // Permite que mi servidor entienda datos en el formato JSON manejado por MONGODB
app.use(cors()); // Permite que mi página web se comunique con este servidor sin bloqueos

// Las rutas son los caminos que definen cómo se accede a los recursos de mi servidor

const productosRutas = require('./routes/productos'); 
const authRutas = require('./routes/auth'); 

app.use('/api/productos', productosRutas);
app.use('/api/auth', authRutas);

// Llamamos a conectar a MongoDB
conectarDB();

// Encendemos el servidor en el puerto definido en las variables de entorno o en el puerto 3000 por defecto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en: http://localhost:${PORT}`);
});