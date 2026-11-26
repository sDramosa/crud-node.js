import { useEffect, useState } from 'react';
import { productosApi } from '../services/api';
import TarjetaProducto from '../components/TarjetaProducto';

export default function CatalogoPage() {
  const [productos, setProductos] = useState([]);
  const [paginacion, setPaginacion] = useState({
    paginaActual: 1,
    totalPaginas: 1,
    totalProductos: 0,
    tieneSiguiente: false,
    tieneAnterior: false
  });

  const [buscar, setBuscar] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [filtrosActivos, setFiltrosActivos] = useState({ buscar: '', precioMax: '' });
  const [pagina, setPagina] = useState(1);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;

    async function cargarCatalogo() {
      try {
        setCargando(true);
        setError('');
        const data = await productosApi.listar({
          page: pagina,
          limit: 6,
          buscar: filtrosActivos.buscar,
          precioMax: filtrosActivos.precioMax
        });

        if (!activo) return;
        setProductos(data.productos || []);
        if (data.paginacion) {
          setPaginacion(data.paginacion);
        }
      } catch (err) {
        if (!activo) return;
        setError(err.message || 'Error al cargar los productos.');
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarCatalogo();
    return () => {
      activo = false;
    };
  }, [pagina, filtrosActivos]);

  function aplicarFiltros(e) {
    e.preventDefault();
    setPagina(1);
    setFiltrosActivos({ buscar, precioMax });
  }

  function limpiarFiltros() {
    setBuscar('');
    setPrecioMax('');
    setPagina(1);
    setFiltrosActivos({ buscar: '', precioMax: '' });
  }

  return (
    <main style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Catálogo de Productos</h1>

      <form
        onSubmit={aplicarFiltros}
        style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}
      >
        <input
          type="text"
          placeholder="Buscar por nombre o descripción..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
        />

        <input
          type="number"
          min="0"
          step="any"
          placeholder="Precio máximo (MXN)"
          value={precioMax}
          onChange={(e) => setPrecioMax(e.target.value)}
        />

        <button type="submit">Filtrar</button>
        <button type="button" onClick={limpiarFiltros}>Limpiar</button>
      </form>

      {cargando && <p>Cargando productos...</p>}
      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      {!cargando && !error && productos.length === 0 && (
        <p>No se encontraron productos con esos criterios.</p>
      )}

      {!cargando && !error && productos.length > 0 && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1rem'
            }}
          >
            {productos.map((prod) => (
              <TarjetaProducto key={prod._id} producto={prod} />
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '1.5rem'
            }}
          >
            <button
              type="button"
              disabled={!paginacion.tieneAnterior}
              onClick={() => setPagina((prev) => Math.max(prev - 1, 1))}
            >
              Anterior
            </button>

            <span>
              Página {paginacion.paginaActual} de {paginacion.totalPaginas} ({paginacion.totalProductos}{' '}
              productos)
            </span>

            <button
              type="button"
              disabled={!paginacion.tieneSiguiente}
              onClick={() => setPagina((prev) => prev + 1)}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </main>
  );
}