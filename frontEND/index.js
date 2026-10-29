const URL_API = 'http://localhost:3000/api/productos';
const contenedorProductos = document.getElementById('contenedor-productos');
const formProducto = document.getElementById('form-producto');
const btnLogout = document.getElementById('btn-logout');

let editandoId = null;

// Verificamoa si el usuario tiene una sesión activa
const token = localStorage.getItem('token');
if (!token) {
    // Si no hay token, lo mandamos directo al login
    window.location.href = 'login.html';
}

// FUNCIONES CRUD para el catálogo de productos

// Función para obtener los productos del Backend (GET)
async function obtenerProductos() {
    try {
        const res = await fetch(URL_API);
        const productos = await res.json();

        // Limpiar el contenedor
        contenedorProductos.innerHTML = '';

        if (productos.length === 0) {
            contenedorProductos.innerHTML = '<p>No hay productos registrados en el catálogo.</p>';
            return;
        }

        // Manipular el DOM para crear cada tarjeta
        productos.forEach(prod => {
            const tarjeta = document.createElement('div');
            tarjeta.className = 'tarjeta-producto';
            tarjeta.innerHTML = `
                <div>
                    <h3>${prod.nombre}</h3>
                    <p>${prod.descripcion}</p>
                    <div class="precio-tag">$${prod.precio}</div>
                    <p><strong>Stock:</strong> ${prod.stock} unidades</p>
                </div>
                <div style="display: flex; gap: 0.5rem; margin-top: 0.8rem;">
                    <button class="btn-editar" onclick="cargarParaEditar('${prod._id}', '${prod.nombre}', ${prod.precio}, ${prod.stock}, '${prod.descripcion}')">Editar</button>
                    <button class="btn-eliminar" onclick="eliminarProducto('${prod._id}')" style="flex: 1;">Eliminar</button>
                </div>`;
            contenedorProductos.appendChild(tarjeta);
        });

    } catch (error) {
        console.error('Error al cargar productos:', error);
        contenedorProductos.innerHTML = '<p style="color: #f87171;">Error al conectar con el servidor.</p>';
    }
}

// Función para agregar un nuevo producto (POST validando Token)
formProducto.addEventListener('submit', async (e) => {
    e.preventDefault();

    const productoData = {
        nombre: document.getElementById('nombre').value,
        precio: Number(document.getElementById('precio').value),
        stock: Number(document.getElementById('stock').value),
        descripcion: document.getElementById('descripcion').value
    };

    try {
        let res;
        if (editandoId) {
            // SI ESTAMOS EDITANDO: Hacemos una petición PUT
            res = await fetch(`${URL_API}/${editandoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productoData)
            });
        } else {
            // SI ES NUEVO: Hacemos una petición POST
            res = await fetch(URL_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productoData)
            });
        }

        const data = await res.json();

        if (res.ok) {
            alert(editandoId ? '¡Producto actualizado con éxito!' : '¡Producto agregado con éxito!');
            
            // Limpiamos el formulario y reseteamos el estado de edición
            formProducto.reset();
            editandoId = null;
            
            // Regresamos el botón a su estado original
            const btnSubmit = formProducto.querySelector('button[type="submit"]');
            btnSubmit.textContent = 'Guardar Producto';
            btnSubmit.style.backgroundColor = ''; // Regresa al color morado de amethyst

            obtenerProductos(); // Recargamos la lista
        } else {
            alert('Error: ' + (data.mensaje || 'No se pudo procesar la solicitud'));
        }
    } catch (error) {
        console.error('Error al guardar/actualizar producto:', error);
    }
});

// Función para eliminar un producto (DELETE con Token)
async function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;

    try {
        const res = await fetch(`${URL_API}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.ok) {
            obtenerProductos(); // Volver a pintar la lista actualizada
        } else {
            alert('No tienes permisos o ocurrió un error al eliminar.');
        }
    } catch (error) {
        console.error('Error al eliminar:', error);
    }
}

// Función para pasar los datos del producto al formulario superior
function cargarParaEditar(id, nombre, precio, stock, descripcion) {
    editandoId = id; // Guardamos el ID del producto que vamos a modificar
    
    // Rellenamos los inputs con los datos actuales
    document.getElementById('nombre').value = nombre;
    document.getElementById('precio').value = precio;
    document.getElementById('stock').value = stock;
    document.getElementById('descripcion').value = descripcion;

    // Cambiamos visualmente el botón para que el usuario sepa que está editando
    const btnSubmit = formProducto.querySelector('button[type="submit"]');
    btnSubmit.textContent = 'Actualizar Producto';
    btnSubmit.style.backgroundColor = '#3b82f6'; // Un tono azul para diferenciarlo

    // Subimos la vista suavemente hacia el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Cerrar Sesión
btnLogout.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
});

// Cargar productos al iniciar la pantalla
obtenerProductos();