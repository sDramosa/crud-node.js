import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { productosApi } from '../services/api';

export default function DetalleProductoPage() {
  const { id } = useParams();

  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [moneda, setMoneda] = useState('USD');
  const [conversion, setConversion] = useState(null);
  const [cargandoConversion, setCargandoConversion] = useState(false);
  const [errorConversion, setErrorConversion] = useState('');

  useEffect(() => {
    let activo = true;

    async function cargarDetalle() {
      try {
        setCargando(true);
        setError('');
        setConversion(null);
        setMoneda('USD');

        const data = await productosApi.obtenerPorId(id);
        const prod = data.producto || data;

        if (!activo) return;
        setProducto(prod);
      } catch (err) {
        if (!activo) return;
        setError(err.message || 'No se pudo cargar el producto.');
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarDetalle();
    return () => {
      activo = false;
    };
  }, [id]);

  async function manejarCambioMoneda(e) {
    const nuevaMoneda = e.target.value;
    setMoneda(nuevaMoneda);
    setErrorConversion('');

    if (nuevaMoneda === 'MXN') {
      setConversion(null);
      return;
    }

    try {
      setCargandoConversion(true);
      const data = await productosApi.obtenerPrecioConvertido(id, nuevaMoneda);
      setConversion(data);
    } catch (err) {
      setErrorConversion(err.message || 'No se pudo convertir el precio.');
    } finally {
      setCargandoConversion(false);
    }
  }

  return (
    <main className="contenedor">
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/">← Volver al catálogo</Link>
      </div>

      {cargando && <p>Cargando detalle del producto...</p>}
      {error && <p className="texto-error">{error}</p>}

      {!cargando && !error && producto && (
        <article className="tarjeta-detalle">
          {producto.imagen && (
            <img
              src={producto.imagen}
              alt={producto.nombre}
              className="imagen-detalle"
            />
          )}

          <div className="detalle-info">
            <h1>{producto.nombre}</h1>
            <p className="descripcion-detalle">{producto.descripcion}</p>

            <p>
              <strong>Precio base:</strong> ${Number(producto.precio).toFixed(2)} MXN
            </p>
            <p>
              <strong>Disponibilidad (stock):</strong> {producto.stock ?? 'No especificado'}
            </p>

            <div className="fila-controles">
              <label htmlFor="detalle-moneda">Convertir precio a:</label>
              <select id="detalle-moneda" value={moneda} onChange={manejarCambioMoneda}>
                <option value="MXN">MXN</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="CAD">CAD</option>
              </select>
            </div>

            {cargandoConversion && <small>Consultando tipo de cambio...</small>}
            {errorConversion && <small className="texto-error">{errorConversion}</small>}
            {conversion && !cargandoConversion && (
              <p className="resultado-conversion">
                Equivale a <strong>${conversion.precioConvertido} {conversion.monedaDestino}</strong>{' '}
                <span>(Tasa: {conversion.tasaCambio})</span>
              </p>
            )}
          </div>
        </article>
      )}
    </main>
  );
}