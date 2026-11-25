const autorizarRol = require('../middlewares/autorizarRol');

describe('Middleware autorizarRol', () => {
  test('permite el paso si el usuario tiene el rol autorizado', () => {
    const req = { usuario: { rol: 'admin' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    const middleware = autorizarRol('admin');
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('bloquea con 403 si el usuario no tiene permiso', () => {
    const req = { usuario: { rol: 'usuario' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    const middleware = autorizarRol('admin');
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});