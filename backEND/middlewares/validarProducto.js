function validarProducto(req, res, next) {
  const { nombre, precio, stock, descripcion } = req.body;
  const errores = [];

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
    errores.push('El nombre es obligatorio y debe tener al menos 2 caracteres.');
  }

  if (precio === undefined || typeof precio !== 'number' || Number.isNaN(precio) || precio < 0) {
    errores.push('El precio es obligatorio y debe ser un número mayor o igual a 0.');
  }

  if (stock === undefined || typeof stock !== 'number' || !Number.isInteger(stock) || stock < 0) {
    errores.push('El stock es obligatorio y debe ser un número entero mayor o igual a 0.');
  }

  if (!descripcion || typeof descripcion !== 'string' || descripcion.trim().length < 5) {
    errores.push('La descripción es obligatoria y debe tener al menos 5 caracteres.');
  }

  if (errores.length > 0) {
    return res.status(400).json({
      mensaje: 'Datos inválidos en la petición',
      errores
    });
  }

  next();
}

module.exports = validarProducto;