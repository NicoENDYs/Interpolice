import mysql from 'mysql2/promise';
//creamos la conexion
    const dbCnn = await mysql.createConnection({
        host: process.env.DB_host,
        user: process.env.DB_user,
        database: process.env.DB_database,
        password: process.env.DB_password,
        port: process.env.DB_port

    });
    try{
        dbCnn.connect();
        console.log("Conexion a la DB EXITOSA (conexion.js)");
    }
    catch (err){
        console.log(err);
    }
export default dbCnn; // exportamos la conexion para usarla en otros archivos