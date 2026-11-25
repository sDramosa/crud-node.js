import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { guardarToken, obtenerUsuarioActual } from '../utils/auth';

export default function LoginPage({ onAuthChange }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      setCargando(true);
      const data = await authApi.login({ email, password });

      if (!data.token) {
        throw new Error('El servidor no devolvió un token válido.');
      }

      guardarToken(data.token);
      if (onAuthChange) onAuthChange();

      const usuario = obtenerUsuarioActual();
      navigate(usuario?.rol === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <main style={{ padding: '1.5rem', maxWidth: '420px', margin: '0 auto' }}>
      <h1>Iniciar Sesión</h1>

      <form onSubmit={manejarSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          Correo electrónico
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@correo.com"
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          Contraseña
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        {error && <p style={{ color: '#f87171', margin: 0 }}>{error}</p>}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Ingresando...' : 'Entrar'}
        </button>
      </form>

      <p style={{ marginTop: '1rem' }}>
        ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
      </p>
    </main>
  );
}