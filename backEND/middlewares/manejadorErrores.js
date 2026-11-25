function manejadorErrores(err, req, res, next) {
  console.error('💥 Error capturado:', err);

  // Error típico de Mongoose cuando un ID en la URL no tiene formato válido de ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({
      mensaje: 'El formato del identificador proporcionado no es válido.'
    });
  }

  // Error de validación de esquema de Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      mensaje: 'Error de validación en los datos.',
      detalles: Object.values(err.errors).map((e) => e.message)
    });
  }

  // Error de clave duplicada en MongoDB (por ejemplo, correo ya registrado con unique: true)
  if (err.code === 11000) {
    return res.status(409).json({
      mensaje: 'Ya existe un registro con ese valor único.'
    });
  }

  // Respuesta genérica para errores inesperados
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    mensaje: err.message || 'Error interno del servidor.'
  });
}

module.exports = manejadorErrores;