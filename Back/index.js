// importamos la libreria
import express from 'express';
import "dotenv/config";
import cors from 'cors';
import path, { dirname } from 'path';     
import { fileURLToPath } from 'url';         

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



import ciudadanos from './src/ciudadanos.js'; // importamos el router de ciudadanos
import usuarios from './src/usuarios.js'; // importamos el router de usuarios


//cors
const corsOptions = {
    origin: '*', // Permitir todas las solicitudes de origen
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'],
};
const corsMiddleware = cors(corsOptions);

const app = express(); // instanciamos la app
app.use(express.json()); // para que la app entienda el formato json
app.use(cors()); // usamos el middleware de cors

//agregamos las rutas
app.use("/api", ciudadanos); // usamos las rutas de aprendiz
app.use("/api", usuarios); // usamos las rutas de usuarios

// Cambia 'public' por la carpeta donde están las imágenes
app.use('/qr', express.static(path.join(__dirname, 'qr')));

//encendemos la api abriendo un puerto
const port = process.env.APP_port || 4101;
app.listen(port, ()=>{
    console.log(`Api ejecutandose en el puerto http://localhost:${port}`)
})
