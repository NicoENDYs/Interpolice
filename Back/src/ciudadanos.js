import express from 'express';
import dbCnn from './conexion.js';
import path, { dirname } from 'path';     
import fs from 'fs';
import QRCode from 'qrcode';
import { fileURLToPath } from 'url';         

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//Rutas para ciudadanos
const ciudadanos = express.Router();

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

//busqieda por id (codigo)
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

//insertar ciudadano metodo POST
ciudadanos.post("/ciudadano/crear/", async (req, res) => {
    try {

        //la data del ciudadano se recibe en el cuerpo (body) de la solicitud
        let data = {
            codigo: Date.now(),
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            apodo: req.body.apodo,
            fechaNacimiento: req.body.fechaNacimiento,
            planetaOrigen: req.body.planetaOrigen,
            planetaResidencia: req.body.planetaResidencia,
            foto: req.body.foto,
            estado: req.body.estado || "1"
        };

//RELACIONADO QR
        const qrContent = `
        Codigo: ${data.codigo}
        Nombre:${data.nombre}
        Planeta de Origen:${data.planetaOrigen}
        Planeta de Residencia:${data.planetaResidencia}
        Fecha de Nacimiento:${data.fechaNacimiento}
        Apodo:${data.apodo} `; 
        //ruta donde se guardara el QR y nombre del archivo
        const fileName = `${data.codigo}.png`;
        const qrPath = path.join(__dirname, '../qr', fileName);
        //gaurdamos el qr en la carpeta qr
        await QRCode.toFile(qrPath, qrContent);
        //anadimos al json de data la ruta del qr
        data.qr = `/qr/${fileName}`;
//RELACIONADO QR

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
        res.status(500).send({
            estado: "Error",
            mensaje: "Error en la consulta",
            data: err.code,
            error: err.message,
            sql: err.sql,
        });
    }
})

//editar ciudadano metodo PUT
ciudadanos.put('/ciudadano/actualizar/:id', async (req, res) =>
    {
        try {
            let id = req.params.id;
            let data = {
                nombre: req.body.nombre,
                apellido: req.body.apellido,
                apodo: req.body.apodo,
                fechaNacimiento: req.body.fechaNacimiento,
                planetaOrigen: req.body.planetaOrigen,
                planetaResidencia: req.body.planetaResidencia,
                foto: req.body.foto,
                estado: req.body.estado || "1"
            };
            //RELACIONADO QR
            //antes de actualizar, actualizamos el QR
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
            res.status(500).send({
                estado: "Error",
                mensaje: "Error en la consulta",
                data: err.code,
                error: err.message,
                sql: err.sql,
            });
        }
    }
);


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
