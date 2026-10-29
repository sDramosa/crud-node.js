const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    // Verificamos si el token de autenticación está presente en los headers de la petición
    const authHeader = req.headers['authorization'];
    
    // El formato común es "Bearer <token>", así que lo separamos para extraer solo el token
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ mensaje: 'Acceso denegado. No se proporcionó un token de autenticación.' });
    }

    try {
        // Verificamos el token usando la misma clave secreta de nuestro archivo .env
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        
        // Guardamos los datos del usuario en la petición (req.user) por si los necesitamos después
        req.user = verificado;
        
        next(); // Dejamos que la petición continúe hacia su destino (crear/editar/borrar)
    } catch (error) {
        res.status(403).json({ mensaje: 'Token inválido o expirado.' });
    }
};

module.exports = verificarToken;