import { useState } from 'react';
import { Link } from 'react-router-dom';
import { productosApi } from '../services/api';

export default function TarjetaProducto({ producto }) {
  const [moneda, setMoneda] = useState('MXN');
  const [conversion, setConversion] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [errorDivisa, setErrorDivisa] = useState('');

  async function manejarCambioMoneda(e) {
    const nuevaMoneda = e.target.value;
    setMoneda(nuevaMoneda);
    setErrorDivisa('');

    if (nuevaMoneda === 'MXN') {
      setConversion(null);
      return;
    }

    try {
      setCargando(true);
      const data = await productosApi.obtenerPrecioConvertido(producto._id, nuevaMoneda);
      setConversion(data);
    } catch (err) {
      setErrorDivisa(err.message || 'No se pudo convertir.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <article
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '0.75rem',
        padding: '1rem',
        borderRadius: '10px',
        border: '1px solid var(--border)',
        background: 'var(--bg)'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {producto.imagen && (
          <img
            src={producto.imagen}
            alt={producto.nombre}
            style={{
              width: '100%',
              height: '200px',
              objectFit: 'cover',
              borderRadius: '8px',
              display: 'block'
            }}
          />
        )}

        <h3 style={{ margin: '0.25rem 0 0', color: 'var(--text-h)', fontSize: '1.1rem' }}>
          {producto.nombre}
        </h3>

        <p style={{ fontSize: '0.92rem', color: 'var(--text)' }}>
          {producto.descripcion}
        </p>

        <p style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: '1.05rem' }}>
          ${Number(producto.precio).toFixed(2)} MXN
        </p>

        <p style={{ fontSize: '0.88rem', color: 'var(--text)' }}>
          Stock: {producto.stock ?? '—'}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem' }}>Divisa:</span>
          <select value={moneda} onChange={manejarCambioMoneda}>
            <option value="MXN">MXN</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="CAD">CAD</option>
          </select>
        </div>

        {cargando && <small>Calculando...</small>}
        {errorDivisa && <small className="texto-error">{errorDivisa}</small>}
        {conversion && !cargando && (
          <small className="resultado-conversion">
            <strong>${conversion.precioConvertido} {conversion.monedaDestino}</strong> (Tasa: {conversion.tasaCambio})
          </small>
        )}

        <Link to={`/producto/${producto._id}`}>
          <button type="button" style={{ width: '100%' }}>
            Ver detalle
          </button>
        </Link>
      </div>
    </article>
  );
}