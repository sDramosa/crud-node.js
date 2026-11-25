const request = require('supertest');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Asegúrate de tener JWT_SECRET definido en tu entorno de pruebas
process.env.JWT_SECRET = process.env.JWT_SECRET || 'secreto_de_prueba';

jest.mock('../models/Producto', () => {
  return jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue({ _id: '1', nombre: 'Test' })
  }));
});

const app = require('../index');

describe('Seguridad en rutas de productos', () => {
  test('rechaza crear producto (POST /api/productos) sin token', async () => {
    const res = await request(app)
      .post('/api/productos')
      .send({
        nombre: 'Producto sin permiso',
        precio: 100,
        stock: 2,
        descripcion: 'Intento sin autenticación'
      });

    expect([401, 403]).toContain(res.statusCode);
  });

  test('rechaza crear producto si el rol en el JWT es "usuario" y no "admin"', async () => {
    const tokenUsuario = jwt.sign(
      { id: '12345', rol: 'usuario' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${tokenUsuario}`)
      .send({
        nombre: 'Producto no admin',
        precio: 100,
        stock: 2,
        descripcion: 'Intento con rol regular'
      });

    expect(res.statusCode).toBe(403);
  });

  test('rechaza un payload con operador de inyección en consulta/cuerpo', async () => {
    const tokenAdmin = jwt.sign(
      { id: 'admin123', rol: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nombre: { $gt: '' },
        precio: 'no-es-numero',
        stock: -1,
        descripcion: 'x'
      });

    expect(res.statusCode).toBe(400);
  });
});