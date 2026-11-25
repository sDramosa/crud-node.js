const mongoose = require('mongoose');

// El esquema es la estructura de los datos que vamos a almacenar en la base de datos
const usuarioSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'El correo es obligatorio'],
        unique: true, // Para que no se repitan los correos
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    // Modificaciones segunda fase
    rol: { // Añadimos la propiedad o campo rol para poder distinguir a los usuarios
        type: String,
        enum: ['usuario', 'admin'],
        default: 'usuario'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Usuario', usuarioSchema);