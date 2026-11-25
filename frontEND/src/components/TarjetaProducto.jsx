import { useState } from 'react';
import { Link } from 'react-router-dom';
import { productosApi } from '../services/api';

export default function TarjetaProducto({ producto }) {
  const [moneda, setMoneda] = useState('MXN');
  const [conversion, setConversion] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [errorDivisa, setErrorDivisa] = useState('');

  const inicial = (producto.nombre || 'P').trim().charAt(0).toUpperCase();

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
    <article className="tarjeta-producto">
      <div className="post-header">
        <div className="post-autor">
          <span className="post-avatar" aria-hidden="true">{inicial}</span>
          <div>
            <div className="post-usuario">catalogo.store</div>
            <div className="post-stock">Stock: {producto.stock ?? '—'}</div>
          </div>
        </div>
      </div>

      <div className="post-media">
        {producto.imagen ? (
          <img src={producto.imagen} alt={producto.nombre} />
        ) : (
          <span className="post-sin-imagen">Sin foto disponible</span>
        )}
      </div>

      <div className="post-acciones">
        <span className="post-precio">${Number(producto.precio).toFixed(2)} MXN</span>
        <span className="post-stock">#{String(producto._id || '').slice(-4)}</span>
      </div>

      <div className="post-cuerpo">
        <p className="post-descripcion">
          <strong className="post-titulo">{producto.nombre}</strong> {producto.descripcion}
        </p>

        <div className="post-divisa">
          <label htmlFor={`moneda-${producto._id}`}>Divisa:</label>
          <select id={`moneda-${producto._id}`} value={moneda} onChange={manejarCambioMoneda}>
            <option value="MXN">MXN</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="CAD">CAD</option>
          </select>

          {cargando && <small>Calculando...</small>}
          {errorDivisa && <small className="texto-error">{errorDivisa}</small>}
          {conversion && !cargando && (
            <small>
              <strong>${conversion.precioConvertido} {conversion.monedaDestino}</strong>{' '}
              <span>(Tasa: {conversion.tasaCambio})</span>
            </small>
          )}
        </div>

        <div className="post-footer">
          <Link to={`/producto/${producto._id}`} className="btn-post-detalle">
            Ver detalle
          </Link>
        </div>
      </div>
    </article>
  );
}