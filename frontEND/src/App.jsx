import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import CatalogoPage from './pages/CatalogoPage';
import DetalleProductoPage from './pages/DetalleProductoPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminProductosPage from './pages/AdminProductosPage';
import { cerrarSesion, obtenerUsuarioActual } from './utils/auth';

function BarraNavegacion({ usuario, alCerrarSesion }) {
  const navigate = useNavigate();

  function handleLogout() {
    alCerrarSesion();
    navigate('/');
  }

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        borderBottom: '1px solid #444'
      }}
    >
      <Link to="/">Catálogo</Link>
      <Link to="/admin">Admin</Link>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {usuario ? (
          <>
            <span>Rol: <strong>{usuario.rol}</strong></span>
            <button type="button" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/registro">Registro</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  const [usuario, setUsuario] = useState(() => obtenerUsuarioActual());

  function refrescarUsuario() {
    setUsuario(obtenerUsuarioActual());
  }

  function handleCerrarSesion() {
    cerrarSesion();
    setUsuario(null);
  }

  return (
    <BrowserRouter>
      <BarraNavegacion usuario={usuario} alCerrarSesion={handleCerrarSesion} />

      <Routes>
        <Route path="/" element={<CatalogoPage />} />
        <Route path="/producto/:id" element={<DetalleProductoPage />} />
        <Route path="/login" element={<LoginPage onAuthChange={refrescarUsuario} />} />
        <Route path="/registro" element={<RegisterPage onAuthChange={refrescarUsuario} />} />
        <Route path="/admin" element={<AdminProductosPage />} />
      </Routes>
    </BrowserRouter>
  );
}