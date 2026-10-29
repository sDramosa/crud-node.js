const formLogin = document.getElementById('form-login');
const mensajeError = document.getElementById('mensaje-error');

formLogin.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que la página se recargue sola
    mensajeError.textContent = ''; // Limpiamos errores anteriores

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Petición POST a nuestro backend de Node.js
        const respuesta = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const datos = await respuesta.json();

        if (respuesta.ok) {
            // Cuando el Login es exitoso guardamos el Token en el navegador
            localStorage.setItem('token', datos.token);
            
            alert('¡Inicio de sesión exitoso!');
            
            // Redirigimos al usuario a la página principal del catálogo
            window.location.href = 'index.html'; 
        } else {
            // Si las credenciales son incorrectas, mostramos el mensaje del backend
            mensajeError.textContent = datos.mensaje || 'Credenciales incorrectas';
        }
    } catch (error) {
        console.error('Error de red:', error);
        mensajeError.textContent = 'No se pudo conectar con el servidor backend.';
    }
});