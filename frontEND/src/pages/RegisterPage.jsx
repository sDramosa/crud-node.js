import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { guardarToken, obtenerUsuarioActual } from '../utils/auth';

export default function RegisterPage({ onAuthChange }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setCargando(true);
      const data = await authApi.register({
        nombre: nombre.trim(),
        email: email.trim(),
        password
      });

      if (data.token) {
        guardarToken(data.token);
        if (onAuthChange) onAuthChange();
        const usuario = obtenerUsuarioActual();
        navigate(usuario?.rol === 'admin' ? '/admin' : '/');
      } else {
        navigate('/login');
      }
    } catch (err) {
      setError(err.message || 'No se pudo completar el registro.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <main style={{ padding: '1.5rem', maxWidth: '420px', margin: '0 auto' }}>
      <h1>Crear Cuenta</h1>

      <form onSubmit={manejarSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          Nombre
          <input
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          Correo electrónico
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@correo.com"
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          Contraseña
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          Confirmar contraseña
          <input
            type="password"
            required
            minLength={6}
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            placeholder="Repite tu contraseña"
          />
        </label>

        {error && <p style={{ color: '#f87171', margin: 0 }}>{error}</p>}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>

      <p style={{ marginTop: '1rem' }}>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
      </p>
    </main>
  );
}