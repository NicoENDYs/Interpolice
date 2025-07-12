import express from 'express';
import dbCnn from './conexion.js';
import path, { dirname } from 'path';     
import fs from 'fs';
import QRCode from 'qrcode';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//Rutas para ciudadanos
const ciudadanos = express.Router();

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../fotos');
        // Crear carpeta si no existe
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generar nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'ciudadano-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB límite
    },
    fileFilter: (req, file, cb) => {
        // Solo permitir imágenes
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen'), false);
        }
    }
});

//esperamos la conexion
await dbCnn.connect();
console.log("Conexion a la DB EXITOSA (ciudadanos.js)");

//consulta para listar todos los ciudadanos
ciudadanos.get("/ciudadano/listar", async (req, res) => {
    try {
        let consulta = "SELECT * FROM ciudadano where Actividad = 'Activo' ORDER BY codigo DESC";

        let [resultado] = await dbCnn.query(consulta);
        res.send({
            estado: "ok",
            mensaje: "Lista de ciudadanos",
            data: resultado
        });
    } catch (err) {
        res.status(500).send({
            estado: "Error",
            mensaje: "Error en la consulta",
            data: err.code,
            error: err.message,
            sql: err.sql,
        });
    }
});

//busqueda por id (codigo)
ciudadanos.get("/ciudadano/listar/:codigo", async (req, res) => {
    try {
        let codigo = req.params.codigo;
        console.log("codigo solicitado: ", codigo);
        let consulta = "SELECT * FROM ciudadano WHERE codigo = ?";
        let [resultado] = await dbCnn.query(consulta, [codigo]);
        if (resultado.length > 0) {
            res.send({
                estado: "ok",
                mensaje: "ciudadano encontrado",
                data: resultado
            }); 
        } else {
            res.status(404).send({
                estado: "Error",
                mensaje: "ciudadano no encontrado",
                data: null
            });
        }
    }
    catch (err) {
        res.status(500).send({
            estado: "Error",
            mensaje: "Error en la consulta",
            data: err.code,
            error: err.message,
            sql: err.sql,
        });
    }
})

//insertar ciudadano metodo POST con subida de archivo
ciudadanos.post("/ciudadano/crear/", upload.single('foto'), async (req, res) => {
    try {
        // Generar código único
        const codigo = Date.now();
        
        //la data del ciudadano se recibe en el cuerpo (body) de la solicitud
        let data = {
            codigo: codigo,
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            apodo: req.body.apodo,
            fechaNacimiento: req.body.fechaNacimiento,
            planetaOrigen: req.body.planetaOrigen,
            planetaResidencia: req.body.planetaResidencia,
            foto: req.file ? req.file.filename : 'default.png', // Usar el nombre del archivo subido
            estado: req.body.estado || "1"
        };

        //RELACIONADO QR
        const qrContent = `
        Codigo: ${data.codigo}
        Nombre: ${data.nombre}
        Planeta de Origen: ${data.planetaOrigen}
        Planeta de Residencia: ${data.planetaResidencia}
        Fecha de Nacimiento: ${data.fechaNacimiento}
        Apodo: ${data.apodo}`; 
        
        //ruta donde se guardara el QR y nombre del archivo
        const fileName = `${data.codigo}.png`;
        const qrPath = path.join(__dirname, '../qr', fileName);
        
        // Crear carpeta qr si no existe
        const qrDir = path.join(__dirname, '../qr');
        if (!fs.existsSync(qrDir)) {
            fs.mkdirSync(qrDir, { recursive: true });
        }
        
        //guardamos el qr en la carpeta qr
        await QRCode.toFile(qrPath, qrContent);
        //añadimos al json de data la ruta del qr
        data.qr = `/qr/${fileName}`;

        // Insertamos el ciudadano en la base de datos
        const consulta = "INSERT INTO ciudadano SET ?";
        const [resultado] = await dbCnn.query(consulta, [data]);
        if (resultado.affectedRows > 0) {
            console.log("ciudadano creado con id: ", data.codigo);
            res.send({
                estado: "ok",
                mensaje: "ciudadano creado",
                data: {
                    id: resultado.insertId,
                    ...data
                }
            });
        } else {
            res.status(404).send({
                estado: "Error",
                mensaje: "ciudadano no creado",
                data: null
            });
        }
    }
    catch (err) {
        console.error("Error al crear ciudadano:", err);
        res.status(500).send({
            estado: "Error",
            mensaje: "Error en la consulta",
            data: err.code,
            error: err.message,
            sql: err.sql,
        });
    }
})

//editar ciudadano metodo PUT con subida de archivo opcional
ciudadanos.put('/ciudadano/actualizar/:id', upload.single('foto'), async (req, res) => {
    try {
        let id = req.params.id;
        
        // Primero obtenemos la foto actual
        const consultaActual = "SELECT foto FROM ciudadano WHERE codigo = ?";
        const [ciudadanoActual] = await dbCnn.query(consultaActual, [id]);
        
        let data = {
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            apodo: req.body.apodo,
            fechaNacimiento: req.body.fechaNacimiento,
            planetaOrigen: req.body.planetaOrigen,
            planetaResidencia: req.body.planetaResidencia,
            foto: req.file ? req.file.filename : (ciudadanoActual[0] ? ciudadanoActual[0].foto : 'default.png'),
            estado: req.body.estado || "1"
        };
        
        //RELACIONADO QR
        const qrContent = `
        Codigo: ${id}
        Nombre: ${data.nombre}
        Planeta de Origen: ${data.planetaOrigen}
        Planeta de Residencia: ${data.planetaResidencia}
        Fecha de Nacimiento: ${data.fechaNacimiento}
        Apodo: ${data.apodo}`;

        //ruta donde se guardara el QR y nombre del archivo
        const fileName = `${id}.png`;
        const qrPath = path.join(__dirname, '../qr', fileName);
        
        //guardamos el qr en la carpeta qr
        await QRCode.toFile(qrPath, qrContent);
        //añadimos al json de data la ruta del qr
        data.qr = `/qr/${fileName}`;    

        //actualizamos el ciudadano en la base de datos
        const consulta = "UPDATE ciudadano SET ? WHERE codigo = ?";
        const [resultado] = await dbCnn.query(consulta, [data, id]);
        if (resultado.affectedRows > 0) {
            res.send({
                estado: "ok",
                mensaje: "ciudadano actualizado",
                data: {
                    id: id,
                    ...data
                }
            });
        } else {
            res.status(404).send({
                estado: "Error",
                mensaje: "ciudadano no encontrado",
                data: null
            });
        }
    }
    catch (err) {
        console.error("Error al actualizar ciudadano:", err);
        res.status(500).send({
            estado: "Error",
            mensaje: "Error en la consulta",
            data: err.code,
            error: err.message,
            sql: err.sql,
        });
    }
});

//eliminar ciudadano metodo PUT poniendo el estado en 0
ciudadanos.put('/ciudadano/eliminar/:id', async (req, res) => {
    try {
        let id = req.params.id;

        const consulta = "UPDATE ciudadano SET Actividad = 'Inactivo' WHERE codigo = ?";
        const [resultado] = await dbCnn.query(consulta, [id]);
        
        res.send({
            estado: "ok",
            mensaje: "ciudadano eliminado",
            data: {
                id: id,
                Actividad: "Inactivo"
            }
        });
    } catch (err) {
        res.status(500).send({
            estado: "Error",
            mensaje: "Error en la consulta",
            data: err.code,
            error: err.message,
            sql: err.sql,
        });
    }
}); 

// exportamos el router para usarlo en otros archivos
export default ciudadanos;