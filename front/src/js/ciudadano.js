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
    tdFoto.innerHTML = `<img src="${item.foto}"  class="img-thumbnail" style="width: 50px; height: 50px;">`;
    let Qr = item.qr;
    tdQR.innerHTML = `<img src="http://localhost:4100${Qr}" alt="QR" width="80" height="80">`;
    
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
    btnEditar.classList.add("btn", "btn-primary"); // Cambié a btn-primary como en tu ejemplo
    btnEditar.setAttribute("data-bs-toggle", "modal");
    btnEditar.setAttribute("data-bs-target", "#ModalEditar"); // Usar tu ID de modal
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
            if (ciudadano.foto) {
                document.getElementById("previewFotoEdit").src = `http://localhost:4100/fotos/${ciudadano.foto}`; // ajusta la ruta si no es /qr/
                document.getElementById("previewFotoEdit").style.display = "block";
            } else {
                document.getElementById("previewFotoEdit").style.display = "none";
            }

            // Estado (seleccionar la opción correspondiente)
            document.getElementById("estadoEdit").value = ciudadano.estado;
        });
    //Editar(codigo);
}


    let btnEditar = document.querySelector("#btn-edit-ciudadano");

    btnEditar.addEventListener("click", (e) => {
        e.preventDefault();
    let codigo = document.getElementById("IdEdit").value;

        let JsonData = JSON.stringify({
        nombre: document.getElementById("nombreEdit").value,
        apellido: document.getElementById("apellidoEdit").value,
        apodo: document.getElementById("apodoEdit").value,
        fechaNacimiento: document.getElementById("fechaNacimientoEdit").value,
        planetaOrigen: document.getElementById("planetaOrigenEdit").value,
        planetaResidencia: document.getElementById("planetaResidenciaEdit").value,
        foto: "imgMonito.png",
        estado: document.getElementById("estadoEdit").value
    });
        console.log(codigo);
        console.log(JsonData);
        Editar(codigo, JsonData);


    });




function Editar(codigo, jsonData) {
    const options = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'insomnia/10.3.1' },
        body: jsonData
    };

    fetch('http://localhost:4100/api/ciudadano/actualizar/' + codigo, options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));  



    Swal.fire({
        title: 'Éxito',
        text: 'Ciudadano actualizado correctamente',
        icon: 'success',
        confirmButtonText: 'Aceptar'
    });
    setTimeout(() => {
    location.reload();
}, 3000);
    cargarCiudadano()
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
    let fotoInput = document.getElementById("foto");
    let foto = fotoInput.files[0]?.name || ""; // solo el nombre del archivo
    let estado = document.getElementById("estado").value;

    // Validaciones básicas
    if (!nombre || !fechaNacimiento || !planetaOrigen || !planetaResidencia) {
        Swal.fire({
            title: "Error!",
            text: "los campos Nombre, fecha de Nacimiento, plateta de Origen y de Residencia deben completarse.",
            icon: "error",
            confirmButtonText: "OK"
        });
        return;
    }

    // Preparar JSON
    let ciudadano = {
        nombre,
        apellido,
        apodo,
        fechaNacimiento,
        planetaOrigen,
        planetaResidencia,
        foto,
        estado
    };

    // Enviar al backend
    crearCiudadano(ciudadano);
});

function crearCiudadano(data) {
    fetch(url + "crear", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(respuesta => {
        if (respuesta.success || respuesta.data) {
            // Limpiar formulario
            formCiudadano.reset();

            // Agregar fila a la tabla
            agregarFilaATabla(respuesta.data);

            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById("exampleModal"));
            modal.hide();

            // Mensaje de éxito
            Swal.fire({
                title: "Éxito",
                text: "El ciudadano ha sido registrado.",
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
            text: "No se pudo agregar el ciudadano.",
            icon: "error"
        });
    });
}





























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



