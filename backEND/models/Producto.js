const mongoose = require('mongoose');

// El esquema es la estructura de los datos (de tipo producto) que vamos a almacenar en la base de datos
const productoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del producto es obligatorio']
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción es obligatoria']
    },
    precio: {
        type: Number,
        required: [true, 'El precio es obligatorio']
    },
    stock: {
        type: Number,
        default: 0 // Si no ponen stock, por defecto asumimos que hay 0
    },
    imagen: {
        type: String // Aquí guardaremos el enlace de la imagen del producto
    }
}, {
    timestamps: true // Esto crea automáticamente la fecha de cuándo se creó y cuándo se actualizó el producto
});

// Aquí exportamos el modelo de producto para poder usarlo en otros archivos
module.exports = mongoose.model('Producto', productoSchema);