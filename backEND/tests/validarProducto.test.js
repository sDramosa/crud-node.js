const validarProducto = require('../middlewares/validarProducto');

describe('Middleware validarProducto', () => {
  test('rechaza con 400 si el precio es negativo', () => {
    const req = {
      body: {
        nombre: 'Pulsera',
        precio: -50,
        stock: 3,
        descripcion: 'Pulsera artesanal'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    validarProducto(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('llama a next() cuando los datos del producto son válidos', () => {
    const req = {
      body: {
        nombre: 'Pulsera',
        precio: 120,
        stock: 5,
        descripcion: 'Pulsera hecha a mano'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    validarProducto(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});