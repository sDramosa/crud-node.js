function autorizarRol(...rolesPermitidos) {
  return (req, res, next) => {
    const usuarioActual = req.user || req.usuario;

    if (!usuarioActual || !rolesPermitidos.includes(usuarioActual.rol)) {
      return res.status(403).json({
        mensaje: 'Acceso denegado: no tienes permisos suficientes para esta acción.'
      });
    }

    next();
  };
}

module.exports = autorizarRol;