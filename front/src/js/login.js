    import '../scss/login.scss';

    const API_URL = "http://localhost:4100/api/";
        
        // Verificar si hay una sesión activa al cargar la página
        document.addEventListener('DOMContentLoaded', function() {
            const usuarioLogueado = obtenerUsuarioLogueado();
            if (usuarioLogueado) {
                mostrarDashboard(usuarioLogueado);
            }
        });

        // Manejar el formulario de login
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const usuario = document.getElementById('usuario').value.trim();
            const password = document.getElementById('password').value.trim();
            
            if (!usuario || !password) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Por favor ingresa usuario y contraseña'
                });
                return;
            }
            
            iniciarSesion(usuario, password);
        });

        // Función para iniciar sesión
        function iniciarSesion(usuario, password) {
            const btnLogin = document.getElementById('btnLogin');
            btnLogin.disabled = true;
            btnLogin.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Iniciando sesión...';
            
            fetch(API_URL + 'usuario/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usuario, pass: password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.estado === 'ok') {
                    // Guardar datos del usuario en localStorage
                    const datosUsuario = {
                        ...data.data,
                        fechaLogin: new Date().toISOString()
                    };
                    
                    // Importante: En un entorno real, usa sessionStorage o tokens JWT
                    sessionStorage.setItem('usuarioLogueado', JSON.stringify(datosUsuario));
                    
                    Swal.fire({
                        icon: 'success',
                        title: '¡Bienvenido!',
                        text: `Hola ${data.data.usuario}, has iniciado sesión correctamente`,
                        timer: 2000,
                        showConfirmButton: false
                    }).then(() => {
                        mostrarDashboard(datosUsuario);
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error de acceso',
                        text: data.mensaje
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error de conexión. Intenta nuevamente.'
                });
            })
            .finally(() => {
                btnLogin.disabled = false;
                btnLogin.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Ingresar';
            });
        }

        // Función para mostrar el dashboard
        function mostrarDashboard(usuario) {
            document.getElementById('loginScreen').classList.add('hidden');
            document.getElementById('dashboardScreen').classList.remove('hidden');
            
            // Llenar información del usuario
            document.getElementById('nombreUsuario').textContent = usuario.usuario;
            document.getElementById('rolUsuario').textContent = usuario.rol || 'Usuario';
            
            // Mostrar último acceso
            const fechaLogin = new Date(usuario.fechaLogin);
            document.getElementById('ultimoAcceso').textContent = fechaLogin.toLocaleString();
            
            // Cargar estadísticas
            cargarEstadisticas();
        }

        // Función para cargar estadísticas
        function cargarEstadisticas() {
            // Cargar total de usuarios
            fetch(API_URL + 'usuario/listar')
                .then(response => response.json())
                .then(data => {
                    if (data.estado === 'ok') {
                        document.getElementById('totalUsuarios').textContent = data.data.length;
                    }
                })
                .catch(error => console.error('Error al cargar usuarios:', error));
            
            // Cargar total de ciudadanos
            fetch(API_URL + 'ciudadano/listar')
                .then(response => response.json())
                .then(data => {
                    if (data.estado === 'ok') {
                        document.getElementById('totalCiudadanos').textContent = data.data.length;
                    }
                })
                .catch(error => console.error('Error al cargar ciudadanos:', error));
        }

        // Función para obtener usuario logueado
        function obtenerUsuarioLogueado() {
            const usuario = sessionStorage.getItem('usuarioLogueado');
            return usuario ? JSON.parse(usuario) : null;
        }

        // Manejar cierre de sesión
        document.getElementById('btnLogout').addEventListener('click', function() {
            Swal.fire({
                title: '¿Cerrar sesión?',
                text: "¿Estás seguro de que quieres cerrar sesión?",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, cerrar sesión',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    sessionStorage.removeItem('usuarioLogueado');
                    document.getElementById('dashboardScreen').classList.add('hidden');
                    document.getElementById('loginScreen').classList.remove('hidden');
                    document.getElementById('loginForm').reset();
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Sesión cerrada',
                        text: 'Has cerrado sesión correctamente',
                        timer: 1500,
                        showConfirmButton: false
                    });
                }
            });
        });