---
title: "UNITED STADES SPACE FORCE - API"
description: "desarrollar la aplicación que permita manejar esta información; para la primer versión del software, se requiere construir un API para almacenar y gestionar la información de dichos ciudadanos,"
---

# Iniciamos descaarga de dependencias

```Bash
npm i cors dotenv express mysql2 nodemon
```

# creamos el archivo .env
este contendra las variables de entorno

```env
DB_host="localhost"
DB_user="root"
DB_database="Interpolice"
DB_port="3307"
APP_port="4100"
DB_password= ""
```
# creamos el archivo conexion.js

```javascript
import mysql from 'mysql2';
//creamos la variable de conexion a la base de datos
const dbCnn = await mysql.createConnection 
// se hacen verificaciones (revise el archivo conexion.js)
```

# creamos el archivo ciudadanos.js

```javascript

import express from 'express';
import dbCnn from './conexion.js';

//Rutas para ciudadanos
const ciudadanos = express.Router();

//esperamos la conexion
await dbCnn.connect();
console.log("Conexion a la DB EXITOSA (ciudadanos.js)");
```


#### al final  exportamos el router para usarlo en otros archivos
```javascript
export default ciudadanos;
```
//continuamos con las consultas (revise el archivo ciudadanos.js)



# creamos el archivo index.js

```javascript
import express from 'express';
//ponemos cors dar acceso a la api
import cors from 'cors';
// importamos el router de ciudadanos
import ciudadanos from './src/ciudadanos.js'; 


const app = express(); // instanciamos la app
app.use(express.json()); // para que la app entienda el formato json
app.use(cors()); // usamos el middleware de cors

//agregamos las rutas
app.use("/api", ciudadanos); // usamos las rutas de aprendiz


//encendemos la api abriendo un puerto
const port = process.env.APP_port || 4101;
app.listen(port, ()=>{
    console.log(`Api ejecutandose en el puerto http://localhost:${port}`)
})

```


# Creamos las consultas de API

```javascript
//obtener todos los ciudadanos
http://localhost:4100/api/ciudadano/listar

//obtener un ciudadano por codigo
http://localhost:4100/api/ciudadano/listar/:codigo

//crear un ciudadano
http://localhost:4100/api/ciudadano/crear

//actualizar un ciudadano
http://localhost:4100/api/ciudadano/actualizar/:id

//eliminar un ciudadano (se inactiva en el campo actividad)
http://localhost:4100/api/ciudadano/eliminar/:id

```


# Apartir de ete punto se comienza a trabajar en el front end
###### esperemos que no me lo tire 🙏