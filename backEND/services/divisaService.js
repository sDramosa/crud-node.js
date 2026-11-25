const MONEDAS_SOPORTADAS = ['USD', 'EUR', 'CAD', 'MXN'];

async function obtenerTipoCambio(monedaDestino = 'USD') {
  const destino = String(monedaDestino).toUpperCase().trim();

  if (!MONEDAS_SOPORTADAS.includes(destino)) {
    const error = new Error(`Moneda no soportada. Usa alguna de: ${MONEDAS_SOPORTADAS.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  if (destino === 'MXN') {
    return {
      monedaBase: 'MXN',
      monedaDestino: 'MXN',
      tasaCambio: 1
    };
  }

  const url = `https://open.er-api.com/v6/latest/MXN`;

  try {
    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      const error = new Error('No se pudo consultar el servicio externo de tipo de cambio.');
      error.statusCode = 502;
      throw error;
    }

    const datos = await respuesta.json();
    const tasa = datos?.rates?.[destino];

    if (typeof tasa !== 'number' || Number.isNaN(tasa)) {
      const error = new Error(`No se encontró una tasa válida para ${destino}.`);
      error.statusCode = 502;
      throw error;
    }

    return {
      monedaBase: 'MXN',
      monedaDestino: destino,
      tasaCambio: tasa
    };
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 503;
      error.message = 'Servicio de divisas no disponible temporalmente.';
    }
    throw error;
  }
}

async function convertirPrecioDesdeMXN(precioMXN, monedaDestino = 'USD') {
  const monto = Number(precioMXN);

  if (Number.isNaN(monto) || monto < 0) {
    const error = new Error('El precio del producto no es válido para convertir.');
    error.statusCode = 400;
    throw error;
  }

  const infoCambio = await obtenerTipoCambio(monedaDestino);
  const precioConvertido = Number((monto * infoCambio.tasaCambio).toFixed(2));

  return {
    ...infoCambio,
    precioOriginalMXN: monto,
    precioConvertido
  };
}

module.exports = {
  obtenerTipoCambio,
  convertirPrecioDesdeMXN
};