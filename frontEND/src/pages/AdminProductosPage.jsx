import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productosApi } from '../services/api';
import { obtenerUsuarioActual } from '../utils/auth';

const FORMULARIO_INICIAL = {
  nombre: '',
  descripcion: '',
  precio: '',
  stock: '',
  imagen: ''
};

export default function AdminProductosPage() {
  const usuario = obtenerUsuarioActual();
  const esAdmin = usuario?.rol === 'admin';

  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(FORMULARIO_INICIAL);
  const [editandoId, setEditandoId] = useState(null);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  async function cargarProductos() {
    try {
      setCargandoLista(true);
      setError('');
      // Pedimos un límite amplio para gestionar productos fácilmente en el panel
      const data = await productosApi.listar({ page: 1, limit: 50 });
      setProductos(data.productos || []);
    } catch (err) {
      setError(err.message || 'Error al cargar productos.');
    } finally {
      setCargandoLista(false);
    }
  }

  useEffect(() => {
    if (esAdmin) {
      cargarProductos();
    } else {
      setCargandoLista(false);
    }
  }, [esAdmin]);

  if (!usuario) {
    return (
      <main style={{ padding: '1.5rem', maxWidth: '700px', margin: '0 auto' }}>
        <h1>Panel de Administración</h1>
        <p>Necesitas iniciar sesión para acceder a esta vista.</p>
        <Link to="/login">Ir a Login</Link>
      </main>
    );
  }

  if (!esAdmin) {
    return (
      <main style={{ padding: '1.5rem', maxWidth: '700px', margin: '0 auto' }}>
        <h1>Acceso Denegado</h1>
        <p>Tu usuario tiene rol <strong>{usuario.rol || 'sin rol'}</strong> y requiere rol <strong>admin</strong>.</p>
        <Link to="/">Volver al catálogo</Link>
      </main>
    );
  }

  function manejarCambio(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function iniciarEdicion(producto) {
    setMensaje('');
    setError('');
    setEditandoId(producto._id);
    setForm({
      nombre: producto.nombre || '',
      descripcion: producto.descripcion || '',
      precio: producto.precio ?? '',
      stock: producto.stock ?? '',
      imagen: producto.imagen || ''
    });
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setForm(FORMULARIO_INICIAL);
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setMensaje('');
    setError('');

    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio: Number(form.precio),
      stock: Number(form.stock),
      ...(form.imagen.trim() ? { imagen: form.imagen.trim() } : {})
    };

    try {
      setGuardando(true);
      if (editandoId) {
        await productosApi.actualizar(editandoId, payload);
        setMensaje('Producto actualizado correctamente.');
      } else {
        await productosApi.crear(payload);
        setMensaje('Producto creado correctamente.');
      }

      setForm(FORMULARIO_INICIAL);
      setEditandoId(null);
      await cargarProductos();
    } catch (err) {
      setError(err.message || 'No se pudo guardar el producto.');
    } finally {
      setGuardando(false);
    }
  }

  async function manejarEliminar(id, nombre) {
    setMensaje('');
    setError('');

    const confirmar = window.confirm(`¿Eliminar "${nombre}"?`);
    if (!confirmar) return;

    try {
      await productosApi.eliminar(id);
      if (editandoId === id) {
        cancelarEdicion();
      }
      setMensaje('Producto eliminado.');
      await cargarProductos();
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el producto.');
    }
  }

  return (
    <main style={{ padding: '1.5rem', maxWidth: '960px', margin: '0 auto' }}>
      <h1>Panel de Administración</h1>

      <section style={{ border: '1px solid #444', borderRadius: '8px', padding: '1rem', marginBottom: '2rem' }}>
        <h2>{editandoId ? 'Editar Producto' : 'Nuevo Producto'}</h2>

        <form onSubmit={manejarSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
          <input
            type="text"
            name="nombre"
            required
            placeholder="Nombre del producto"
            value={form.nombre}
            onChange={manejarCambio}
          />

          <textarea
            name="descripcion"
            required
            rows={2}
            placeholder="Descripción"
            value={form.descripcion}
            onChange={manejarCambio}
          />

          // Informa al navegador que el campo de precio es obligatorio y debe ser un número entero mayor o igual a 0, 
              lo cual coincide con la validación en el middleware 
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <input
              type="number"
              name="precio"
              required
              min="0"
              step="any"
              placeholder="Precio (MXN)"
              value={form.precio}
              onChange={manejarCambio}
            />

            <input
              type="number"
              name="stock"
              required
              min="0"
              step="1"
              placeholder="Stock"
              value={form.stock}
              onChange={manejarCambio}
            />
          </div>

          <input
            type="url"
            name="imagen"
            placeholder="URL de imagen (opcional)"
            value={form.imagen}
            onChange={manejarCambio}
          />

          {mensaje && <p style={{ color: '#4ade80', margin: 0 }}>{mensaje}</p>}
          {error && <p style={{ color: '#f87171', margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" disabled={guardando}>
              {guardando
                ? 'Guardando...'
                : editandoId
                ? 'Guardar cambios'
                : 'Crear producto'}
            </button>

            {editandoId && (
              <button type="button" onClick={cancelarEdicion}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <h2>Productos existentes</h2>

        {cargandoLista && <p>Cargando...</p>}

        {!cargandoLista && productos.length === 0 && <p>No hay productos registrados.</p>}

        {!cargandoLista && productos.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {productos.map((prod) => (
              <div
                key={prod._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem'
                }}
              >
                <div>
                  <strong>{prod.nombre}</strong> — ${Number(prod.precio).toFixed(2)} MXN
                  <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>
                    Stock: {prod.stock ?? '—'} · {prod.descripcion}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={() => iniciarEdicion(prod)}>
                    Editar
                  </button>
                  <button type="button" onClick={() => manejarEliminar(prod._id, prod.nombre)}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}