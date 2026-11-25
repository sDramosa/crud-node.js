const express = require('express'); // Importamos Express para crear rutas
const router = express.Router(); // Creamos un router para manejar las rutas de productos
const Producto = require('../models/Producto'); // Importamos el modelo de Producto para interactuar con la base de datos
const verificarToken = require('../middlewares/authMiddleware'); // Verifica que el JWT sea válido
const autorizarRol = require('../middlewares/autorizarRol'); // Verifica el rol del usuario (ej. admin)
const validarProducto = require('../middlewares/validarProducto'); // Valida los datos antes de guardar o actualizar
const { convertirPrecioDesdeMXN } = require('../services/divisaService'); // Servicio de conversión con API externa

// READ (Lectura) permite obtener todos los productos con filtros y paginación (PÚBLICA - Sin token)
async function obtenerProductos(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 6, 1), 50);
    const skip = (page - 1) * limit;

    const filtro = {};

    if (req.query.buscar && req.query.buscar.trim() !== '') {
      const texto = req.query.buscar.trim();
      filtro.$or = [
        { nombre: { $regex: texto, $options: 'i' } },
        { descripcion: { $regex: texto, $options: 'i' } }
      ];
    }

    if (req.query.precioMax !== undefined && req.query.precioMax !== '') {
      const max = Number(req.query.precioMax);
      if (!Number.isNaN(max) && max >= 0) {
        filtro.precio = { ...filtro.precio, $lte: max };
      }
    }

    const [productos, totalProductos] = await Promise.all([
      Producto.find(filtro)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Producto.countDocuments(filtro)
    ]);

    const totalPaginas = Math.ceil(totalProductos / limit) || 1;

    res.status(200).json({
      productos,
      paginacion: {
        paginaActual: page,
        limitePorPagina: limit,
        totalProductos,
        totalPaginas,
        tieneSiguiente: page < totalPaginas,
        tieneAnterior: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
}

// Registramos la ruta GET principal del catálogo
router.get('/', obtenerProductos);

// CONVERSIÓN DE PRECIO (PÚBLICA - Consulta API externa de tipo de cambio)
router.get('/:id/precio-convertido', async (req, res, next) => {
  try {
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado.' });
    }

    const moneda = req.query.moneda || 'USD';
    const conversion = await convertirPrecioDesdeMXN(producto.precio, moneda);

    res.status(200).json({
      productoId: producto._id,
      nombre: producto.nombre,
      ...conversion
    });
  } catch (error) {
    next(error);
  }
});

// CREATE (Creación) permite agregar un nuevo producto (PROTEGIDA - Solo admin + datos validados)
router.post(
    '/',
    verificarToken,
    autorizarRol('admin'),
    validarProducto,
    async (req, res) => {
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
    }
);

// UPDATE (Actualización) permite modificar un producto (PROTEGIDA - Solo admin + datos validados)
router.put(
    '/:id',
    verificarToken,
    autorizarRol('admin'),
    validarProducto,
    async (req, res) => {
        try {
            const { id } = req.params;
            const productoActualizado = await Producto.findByIdAndUpdate(
                id,
                req.body,
                { new: true, runValidators: true }
            );

            if (!productoActualizado) {
                return res.status(404).json({ mensaje: 'Producto no encontrado' });
            }

            res.json(productoActualizado);
        } catch (error) {
            res.status(400).json({ mensaje: 'Error al actualizar el producto', error: error.message });
        }
    }
);

// DELETE (Eliminación) permite borrar un producto (PROTEGIDA - Solo admin)
router.delete(
    '/:id',
    verificarToken,
    autorizarRol('admin'),
    async (req, res) => {
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
    }
);

module.exports = router;