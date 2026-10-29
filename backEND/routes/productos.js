const express = require('express'); // Importamos Express para crear rutas
const router = express.Router(); // Creamos un router para manejar las rutas de productos
const Producto = require('../models/Producto'); // Importamos el modelo de Producto para interactuar con la base de datos
const verificarToken = require('../middlewares/authMiddleware'); // Importamos el middleware de autenticación para proteger ciertas rutas

// READ (Lectura) permite obtener todos los productos (PÚBLICA - Sin token)
router.get('/', async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener los productos', error: error.message });
    }
});

// CREATE (Creación) permite agregar un nuevo producto (PROTEGIDA - Requiere token)
router.post('/', verificarToken, async (req, res) => { // <--- AQUÍ APLICAMOS EL MIDDLEWARE
    try {
        const nuevoProducto = new Producto({
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            precio: req.body.precio,
            stock: req.body.stock,
            imagen: req.body.imagen
        });

        const productoGuardado = await nuevoProducto.save();
        res.status(201).json(productoGuardado);
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al crear el producto', error: error.message });
    }
});

// UPDATE (Actualización) permite modificar un producto (PROTEGIDA - Requiere token)
router.put('/:id', verificarToken, async (req, res) => { // El middleware verificarToken se aplica aquí para proteger la ruta
    try {
        const { id } = req.params;
        const productoActualizado = await Producto.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!productoActualizado) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }

        res.json(productoActualizado);
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al actualizar el producto', error: error.message });
    }
});

// DELETE (Eliminación) permite borrar un producto (PROTEGIDA - Requiere token)
router.delete('/:id', verificarToken, async (req, res) => { // Nuevamente, aplicamos el middleware verificarToken para proteger la ruta de eliminación
    try {
        const { id } = req.params;
        const productoEliminado = await Producto.findByIdAndDelete(id);

        if (!productoEliminado) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }

        res.json({ mensaje: '¡Producto eliminado exitosamente!', producto: productoEliminado });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar el producto', error: error.message });
    }
});

module.exports = router;