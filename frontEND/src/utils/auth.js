export function guardarToken(token) {
  localStorage.setItem('token', token);
}

export function obtenerToken() {
  return localStorage.getItem('token');
}

export function cerrarSesion() {
  localStorage.removeItem('token');
}

export function obtenerUsuarioActual() {
  const token = obtenerToken();
  if (!token) return null;

  try {
    const partes = token.split('.');
    if (partes.length !== 3) return null;

    const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);

    // Verificar expiración si viene el campo `exp` (en segundos)
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      cerrarSesion();
      return null;
    }

    return payload; // Ej. { id: '...', rol: 'admin', iat: ..., exp: ... }
  } catch {
    return null;
  }
}