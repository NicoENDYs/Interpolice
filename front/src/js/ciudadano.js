import '../scss/ciudadano.scss';
import * as bootstrap from "bootstrap";
import Swal from "sweetalert2";

const url = "http://localhost:4100/api/ciudadano/";

function cargarCiudadano() {
    fetch(url + "listar")
        .then((response) => response.json())
        .then((datos) => {
            llenarTabla(datos);
        });
}
cargarCiudadano();

function llenarTabla(datos) {
    const tabla = document.querySelector("#tbody-ciudadano");
    tabla.innerHTML = ""; // Limpia la tabla antes de llenarla

    datos.data.forEach((item) => {
        agregarFilaATabla(item);
    });
}

// NUEVA FUNCIÓN: Agregar una fila individual a la tabla
function agregarFilaATabla(item) {
    const tabla = document.querySelector("#tbody-ciudadano");
    const tr = document.createElement("tr");

    const tdCodigo = document.createElement("td");
    const tdNombre = document.createElement("td");
    const tdApellido = document.createElement("td");
    const tdApodo = document.createElement("td");
    const tdNacimiento = document.createElement("td");
    const tdOrigen = document.createElement("td");
    const tdResidencia = document.createElement("td");
    const tdFoto = document.createElement("td");
    const tdQR = document.createElement("td");
    const tdEstado = document.createElement("td");
    const tdAcciones = document.createElement("td");
    const btnEliminar = document.createElement("button");
    const btnEditar = document.createElement("button");

    tdCodigo.textContent = item.codigo;
    tdNombre.textContent = item.nombre;
    tdApellido.textContent = item.apellido;
    tdApodo.textContent = item.apodo;
    tdNacimiento.textContent = item.fechaNacimiento;
    tdOrigen.textContent = item.planetaOrigen;
    tdResidencia.textContent = item.planetaResidencia;
    
    // Mostrar la foto con la ruta correcta
    if (item.foto && item.foto !== 'default.png') {
        tdFoto.innerHTML = `<img src="http://localhost:4100/fotos/${item.foto}" class="img-thumbnail"  width="90px" height="90px" >`;
    } else {
        tdFoto.innerHTML = `<span class="text-muted">Sin foto</span>`;
    }
    
    let Qr = item.qr;
    tdQR.innerHTML = `<img src="http://localhost:4100${Qr}" alt="QR" width="90px" height="90px">`;
    
    let estado = "";
    switch (item.estado) {
        case "0":
            estado = "muerto"
            break;
        case "1":
            estado = "vivo"
            break;
        case "2":
            estado = "congelado por criogenia"
            break;
    }
    tdEstado.textContent = estado;

    btnEliminar.classList.add("btn", "btn-danger");
    btnEliminar.setAttribute("id", "btn-elim");
    btnEliminar.setAttribute("value", `${item.codigo}`);
    btnEliminar.innerHTML = `<i class="bi bi-trash-fill"></i>`;
    btnEliminar.addEventListener("click", eliminarCiudadano);

    btnEditar.setAttribute("type", "button");
    btnEditar.classList.add("btn", "btn-primary");
    btnEditar.setAttribute("data-bs-toggle", "modal");
    btnEditar.setAttribute("data-bs-target", "#ModalEditar");
    btnEditar.innerHTML = `<i class="bi bi-pencil-square"></i>`;
    btnEditar.setAttribute("value", `${item.codigo}`);
    btnEditar.addEventListener("click", editarCiudadano);

    tdAcciones.appendChild(btnEliminar);
    tdAcciones.appendChild(btnEditar);

    tr.append(
        tdCodigo,
        tdNombre,
        tdApellido,
        tdApodo,
        tdNacimiento,
        tdOrigen,
        tdResidencia,
        tdFoto,
        tdQR,
        tdEstado,
        tdAcciones
    );
    tabla.appendChild(tr);
}

//eliminar 
function eliminarCiudadano() {
    let codigo = this.getAttribute("value");
    console.log(codigo);

    const options = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'insomnia/10.3.1' },
    };

    fetch('http://localhost:4100/api/ciudadano/eliminar/' + codigo, options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));

    cargarCiudadano()
}

//funcion editar
function editarCiudadano() {
    let codigo = this.getAttribute("value");
    console.log(codigo);

    fetch(url + "listar/" + codigo)
        .then((response) => response.json())
        .then((datos) => {
            console.log(datos);
            let ciudadano = datos.data[0];
            document.getElementById("IdEdit").value = ciudadano.codigo;
            document.getElementById("nombreEdit").value = ciudadano.nombre;
            document.getElementById("apellidoEdit").value = ciudadano.apellido;
            document.getElementById("apodoEdit").value = ciudadano.apodo;

            const fecha = new Date(ciudadano.fechaNacimiento);
            const yyyy = fecha.getFullYear();
            const mm = String(fecha.getMonth() + 1).padStart(2, '0');
            const dd = String(fecha.getDate()).padStart(2, '0');
            document.getElementById("fechaNacimientoEdit").value = `${yyyy}-${mm}-${dd}`;

            document.getElementById("planetaOrigenEdit").value = ciudadano.planetaOrigen;
            document.getElementById("planetaResidenciaEdit").value = ciudadano.planetaResidencia;
            
            if (ciudadano.foto && ciudadano.foto !== 'default.png') {
                document.getElementById("previewFotoEdit").src = `http://localhost:4100/fotos/${ciudadano.foto}`;
                document.getElementById("previewFotoEdit").style.display = "block";
            } else {
                document.getElementById("previewFotoEdit").style.display = "none";
            }

            document.getElementById("estadoEdit").value = ciudadano.estado;
        });
}

let btnEditar = document.querySelector("#btn-edit-ciudadano");

btnEditar.addEventListener("click", (e) => {
    e.preventDefault();
    let codigo = document.getElementById("IdEdit").value;
    
    // Usar FormData para enviar archivos
    const formData = new FormData();
    formData.append('nombre', document.getElementById("nombreEdit").value);
    formData.append('apellido', document.getElementById("apellidoEdit").value);
    formData.append('apodo', document.getElementById("apodoEdit").value);
    formData.append('fechaNacimiento', document.getElementById("fechaNacimientoEdit").value);
    formData.append('planetaOrigen', document.getElementById("planetaOrigenEdit").value);
    formData.append('planetaResidencia', document.getElementById("planetaResidenciaEdit").value);
    formData.append('estado', document.getElementById("estadoEdit").value);
    
    // Añadir archivo si se seleccionó uno
    const fotoFile = document.getElementById("fotoEdit").files[0];
    if (fotoFile) {
        formData.append('foto', fotoFile);
    }
    
    console.log(codigo);
    Editar(codigo, formData);
});

function Editar(codigo, formData) {
    const options = {
        method: 'PUT',
        body: formData // No establecer Content-Type, el navegador lo hará automáticamente
    };

    fetch('http://localhost:4100/api/ciudadano/actualizar/' + codigo, options)
        .then(response => response.json())
        .then(response => {
            console.log(response);
            Swal.fire({
                title: 'Éxito',
                text: 'Ciudadano actualizado correctamente',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
            setTimeout(() => {
                location.reload();
            }, 2000);
        })
        .catch(err => {
            console.error(err);
            Swal.fire({
                title: 'Error',
                text: 'Error al actualizar el ciudadano',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        });
}

///CREAR
let formCiudadano = document.querySelector("#añadir-ciudadano");
let BtnAdd = document.querySelector("#btn-add-ciudadano");

BtnAdd.addEventListener("click", (e) => {
    e.preventDefault();

    // Capturar los valores del formulario
    let nombre = document.getElementById("nombre").value.trim();
    let apellido = document.getElementById("apellido").value.trim();
    let apodo = document.getElementById("apodo").value.trim();
    let fechaNacimiento = document.getElementById("fechaNacimiento").value;
    let planetaOrigen = document.getElementById("planetaOrigen").value.trim();
    let planetaResidencia = document.getElementById("planetaResidencia").value.trim();
    let estado = document.getElementById("estado").value;

    // Validaciones básicas
    if (!nombre || !fechaNacimiento || !planetaOrigen || !planetaResidencia) {
        Swal.fire({
            title: "Error!",
            text: "Los campos Nombre, Fecha de Nacimiento, Planeta de Origen y de Residencia deben completarse.",
            icon: "error",
            confirmButtonText: "OK"
        });
        return;
    }

    // Usar FormData para enviar archivos
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('apellido', apellido);
    formData.append('apodo', apodo);
    formData.append('fechaNacimiento', fechaNacimiento);
    formData.append('planetaOrigen', planetaOrigen);
    formData.append('planetaResidencia', planetaResidencia);
    formData.append('estado', estado);
    
    // Añadir archivo si se seleccionó uno
    const fotoFile = document.getElementById("foto").files[0];
    if (fotoFile) {
        formData.append('foto', fotoFile);
    }

    // Enviar al backend
    crearCiudadano(formData);
});

function crearCiudadano(formData) {
    fetch(url + "crear", {
        method: "POST",
        body: formData 
    })
    .then(res => res.json())
    .then(respuesta => {
        if (respuesta.estado === "ok" || respuesta.data) {
            // Limpiar formulario
            formCiudadano.reset();
            document.getElementById("previewFoto").style.display = "none";

            // Recargar la tabla
            cargarCiudadano();

            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById("exampleModal"));
            modal.hide();

            // Mensaje de éxito
            Swal.fire({
                title: "Éxito",
                text: "El ciudadano ha sido registrado correctamente.",
                icon: "success"
            });
        } else {
            throw new Error("No se pudo registrar el ciudadano.");
        }
    })
    .catch(error => {
        console.error(error);
        Swal.fire({
            title: "Error",
            text: "No se pudo agregar el ciudadano. " + error.message,
            icon: "error"
        });
    });
}

// Preview de imagen para crear
document.getElementById("foto").addEventListener("change", function () {
    const file = this.files[0];
    const preview = document.getElementById("previewFoto");

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = "block";
        };
        reader.readAsDataURL(file);
    } else {
        preview.src = "";
        preview.style.display = "none";
    }
});

// Preview de imagen para editar
document.getElementById("fotoEdit").addEventListener("change", function () {
    const file = this.files[0];
    const preview = document.getElementById("previewFotoEdit");

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = "block";
        };
        reader.readAsDataURL(file);
    } else {
        preview.src = "";
        preview.style.display = "none";
    }
});