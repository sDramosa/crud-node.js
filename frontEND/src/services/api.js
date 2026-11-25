const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function obtenerToken() {
  return localStorage.getItem('token');
}

async function peticion(endpoint, { method = 'GET', body = null, requiereAuth = false } = {}) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (requiereAuth) {
    const token = obtenerToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const configuracion = {
    method,
    headers
  };

  if (body) {
    configuracion.body = JSON.stringify(body);
  }

  const respuesta = await fetch(`${API_URL}${endpoint}`, configuracion);
  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    const error = new Error(datos.mensaje || `Error HTTP ${respuesta.status}`);
    error.status = respuesta.status;
    error.datos = datos;
    throw error;
  }

  return datos;
}

export const authApi = {
  login: (credenciales) =>
    peticion('/auth/login', { method: 'POST', body: credenciales }),
  register: (datosUsuario) =>
    peticion('/auth/register', { method: 'POST', body: datosUsuario })
};

export const productosApi = {
  listar: ({ page = 1, limit = 6, buscar = '', precioMax = '' } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (buscar.trim()) params.set('buscar', buscar.trim());
    if (precioMax !== '') params.set('precioMax', precioMax);
    return peticion(`/productos?${params.toString()}`);
  },
  obtenerPorId: async (id) => {
    try {
      return await peticion(`/productos/${id}`);
    } catch (err) {
      if (err.status !== 404) throw err;
      const data = await peticion('/productos?page=1&limit=100');
      const encontrado = (data.productos || []).find((p) => p._id === id);
      if (!encontrado) {
        const error = new Error('Producto no encontrado.');
        error.status = 404;
        throw error;
      }
      return encontrado;
    }
  },
  obtenerPrecioConvertido: (id, moneda = 'USD') =>
    peticion(`/productos/${id}/precio-convertido?moneda=${encodeURIComponent(moneda)}`),
  crear: (producto) =>
    peticion('/productos', { method: 'POST', body: producto, requiereAuth: true }),
  actualizar: (id, producto) =>
    peticion(`/productos/${id}`, { method: 'PUT', body: producto, requiereAuth: true }),
  eliminar: (id) =>
    peticion(`/productos/${id}`, { method: 'DELETE', requiereAuth: true })
};