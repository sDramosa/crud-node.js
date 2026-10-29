const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Para registrar un nuevo usuario (PÚBLICA - Sin token)
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verificamos si el usuario ya existe
        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ mensaje: 'El correo ya está registrado' });
        }

        // Encriptamos la contraseña (hash)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Creamos el nuevo usuario con la contraseña protegida
        const nuevoUsuario = new Usuario({
            email,
            password: passwordHash
        });

        await nuevoUsuario.save();
        res.status(201).json({ mensaje: '¡Usuario registrado exitosamente!' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al registrar usuario', error: error.message });
    }
});

// Ahora vamos a crear la ruta de login para que los usuarios puedan autenticarse y obtener un token JWT (PÚBLICA - Sin token)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscamos el usuario por correo
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ mensaje: 'Correo o contraseña incorrectos' });
        }

        // Validamos la contraseña comparando la que escribió con la encriptada
        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) {
            return res.status(400).json({ mensaje: 'Correo o contraseña incorrectos' });
        }

        // Creamos el Token (JWT) usando la clave secreta de nuestro archivo .env
        // El token expirará en 1 hora por seguridad
        const token = jwt.sign(
            { id: usuario._id, email: usuario.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.json({
            mensaje: '¡Login exitoso!',
            token // Este es el token que el cliente debe guardar y presentar después
        });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al iniciar sesión', error: error.message });
    }
});

module.exports = router;