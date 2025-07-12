// usuarios.js
import * as bootstrap from "bootstrap";
import Swal from "sweetalert2";

const url = "http://localhost:4100/api/";

// Cargar usuarios al iniciar la página
function cargarUsuarios() {
    fetch(url + "usuario/listar")
        .then((response) => response.json())
        .then((datos) => {
            llenarTabla(datos);
        })
        .catch((error) => {
            console.error("Error al cargar usuarios:", error);
        });
}

// Cargar roles para los select
function cargarRoles() {
    fetch(url + "roles/listar")
        .then((response) => response.json())
        .then((datos) => {
            llenarSelectRoles(datos);
        })
        .catch((error) => {
            console.error("Error al cargar roles:", error);
        });
}

function llenarSelectRoles(datos) {
    const selectCrear = document.querySelector("#rol_id");
    const selectEditar = document.querySelector("#rol_idEdit");
    
    // Limpiar opciones existentes (excepto la primera)
    selectCrear.innerHTML = '<option value="">Seleccione un rol</option>';
    selectEditar.innerHTML = '<option value="">Seleccione un rol</option>';
    
    datos.data.forEach((rol) => {
        const optionCrear = document.createElement("option");
        optionCrear.value = rol.id;
        optionCrear.textContent = rol.rol;
        selectCrear.appendChild(optionCrear);
        
        const optionEditar = document.createElement("option");
        optionEditar.value = rol.id;
        optionEditar.textContent = rol.rol;
        selectEditar.appendChild(optionEditar);
    });
}

function llenarTabla(datos) {
    const tabla = document.querySelector("#tbody-usuarios");
    tabla.innerHTML = ""; // Limpia la tabla antes de llenarla

    datos.data.forEach((item) => {
        agregarFilaATabla(item);
    });
}

// Agregar una fila individual a la tabla
function agregarFilaATabla(item) {
    const tabla = document.querySelector("#tbody-usuarios");
    const tr = document.createElement("tr");

    const tdId = document.createElement("td");
    const tdUsuario = document.createElement("td");
    const tdRol = document.createElement("td");
    const tdFecha = document.createElement("td");
    const tdAcciones = document.createElement("td");
    
    const btnEliminar = document.createElement("button");
    const btnEditar = document.createElement("button");

    tdId.textContent = item.id;
    tdUsuario.textContent = item.usuario;
    tdRol.textContent = item.rol || "Sin rol";
    
    // Formatear fecha
    const fecha = new Date(item.fecha_creacion);
    tdFecha.textContent = fecha.toLocaleDateString();

    // Configurar botón eliminar
    btnEliminar.classList.add("btn", "btn-danger", "btn-sm", "me-2");
    btnEliminar.setAttribute("value", item.id);
    btnEliminar.innerHTML = `<i class="bi bi-trash-fill"></i>`;
    btnEliminar.addEventListener("click", eliminarUsuario);

    // Configurar botón editar
    btnEditar.classList.add("btn", "btn-primary", "btn-sm");
    btnEditar.setAttribute("data-bs-toggle", "modal");
    btnEditar.setAttribute("data-bs-target", "#modalEditar");
    btnEditar.setAttribute("value", item.id);
    btnEditar.innerHTML = `<i class="bi bi-pencil-square"></i>`;
    btnEditar.addEventListener("click", editarUsuario);

    tdAcciones.appendChild(btnEliminar);
    tdAcciones.appendChild(btnEditar);

    tr.append(tdId, tdUsuario, tdRol, tdFecha, tdAcciones);
    tabla.appendChild(tr);
}

// Eliminar usuario
function eliminarUsuario() {
    const id = this.getAttribute("value");
    
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            const options = {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            };

            fetch(url + 'usuario/eliminar/' + id, options)
                .then(response => response.json())
                .then(response => {
                    if (response.estado === "ok") {
                        Swal.fire(
                            'Eliminado!',
                            'El usuario ha sido eliminado.',
                            'success'
                        );
                        cargarUsuarios();
                    } else {
                        Swal.fire('Error!', 'No se pudo eliminar el usuario.', 'error');
                    }
                })
                .catch(err => {
                    console.error(err);
                    Swal.fire('Error!', 'Error al eliminar el usuario.', 'error');
                });
        }
    });
}

// Editar usuario
function editarUsuario() {
    const id = this.getAttribute("value");
    
    fetch(url + "usuario/listar/" + id)
        .then((response) => response.json())
        .then((datos) => {
            const usuario = datos.data[0];
            document.getElementById("idEdit").value = usuario.id;
            document.getElementById("usuarioEdit").value = usuario.usuario;
            document.getElementById("passEdit").value = ""; 
            document.getElementById("rol_idEdit").value = usuario.rol_id;
        })
        .catch((error) => {
            console.error("Error al cargar usuario:", error);
            Swal.fire('Error!', 'No se pudo cargar el usuario.', 'error');
        });
}

// Event listener para el botón de crear usuario
document.addEventListener("DOMContentLoaded", function() {
    const btnCrear = document.querySelector("#btn-crear-usuario");
    
    btnCrear.addEventListener("click", (e) => {
        e.preventDefault();

        const usuario = document.getElementById("usuario").value.trim();
        const pass = document.getElementById("pass").value.trim();
        const rol_id = document.getElementById("rol_id").value;

        // Validaciones
        if (!usuario || !pass || !rol_id) {
            Swal.fire({
                title: "Error!",
                text: "Todos los campos son obligatorios.",
                icon: "error",
                confirmButtonText: "OK"
            });
            return;
        }

        // Preparar datos
        const datosUsuario = {
            usuario,
            pass,
            rol_id
        };

        // Enviar al backend
        crearUsuario(datosUsuario);
    });
});

// Crear usuario
function crearUsuario(data) {
    fetch(url + "usuario/crear/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(respuesta => {
        if (respuesta.estado === "ok") {
            // Limpiar formulario
            document.getElementById("form-crear-usuario").reset();

            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById("modalCrear"));
            modal.hide();

            // Recargar tabla
            cargarUsuarios();

            // Mensaje de éxito
            Swal.fire({
                title: "Éxito",
                text: "El usuario ha sido creado.",
                icon: "success"
            });
        } else {
            Swal.fire('Error!', 'No se pudo crear el usuario.', 'error');
        }
    })
    .catch(error => {
        console.error(error);
        Swal.fire({
            title: "Error",
            text: "No se pudo crear el usuario.",
            icon: "error"
        });
    });
}

// Event listener para el botón de editar usuario
document.addEventListener("DOMContentLoaded", function() {
    const btnEditar = document.querySelector("#btn-editar-usuario");
    
    btnEditar.addEventListener("click", (e) => {
        e.preventDefault();

        const id = document.getElementById("idEdit").value;
        const usuario = document.getElementById("usuarioEdit").value.trim();
        const pass = document.getElementById("passEdit").value.trim();
        const rol_id = document.getElementById("rol_idEdit").value;

        // Validaciones
        if (!usuario || !rol_id) {
            Swal.fire({
                title: "Error!",
                text: "Usuario y rol son obligatorios.",
                icon: "error",
                confirmButtonText: "OK"
            });
            return;
        }

        // Preparar datos
        const datosUsuario = {
            usuario,
            rol_id
        };

        // Solo incluir contraseña si se proporcionó
        if (pass) {
            datosUsuario.pass = pass;
        }

        // Enviar al backend
        actualizarUsuario(id, datosUsuario);
    });
});

// Actualizar usuario
function actualizarUsuario(id, data) {
    const options = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    };

    fetch(url + 'usuario/actualizar/' + id, options)
        .then(response => response.json())
        .then(response => {
            if (response.estado === "ok") {
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById("modalEditar"));
                modal.hide();

                // Recargar tabla
                cargarUsuarios();

                // Mensaje de éxito
                Swal.fire({
                    title: 'Éxito',
                    text: 'Usuario actualizado correctamente',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                });
            } else {
                Swal.fire('Error!', 'No se pudo actualizar el usuario.', 'error');
            }
        })
        .catch(err => {
            console.error(err);
            Swal.fire('Error!', 'Error al actualizar el usuario.', 'error');
        });
}

// Inicializar la aplicación
cargarUsuarios();
cargarRoles();