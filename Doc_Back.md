# API Interpolice - Documentación

## Información General
- **Puerto:** 4100
- **Base URL:** `http://localhost:4100/api`
- **Tecnologías:** Node.js, Express, MySQL, bcrypt, multer, qrcode
- **Documentos:** Recisar la carpeta Documentacion

## Usuarios

### Endpoints
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/usuario/listar` | Lista todos los usuarios |
| GET | `/usuario/listar/:id` | Busca usuario por ID |
| POST | `/usuario/crear/` | Crea nuevo usuario |
| PUT | `/usuario/actualizar/:id` | Actualiza usuario |
| DELETE | `/usuario/eliminar/:id` | Elimina usuario (soft delete) |
| POST | `/usuario/login` | Autenticación de usuario |
| GET | `/roles/listar` | Lista todos los roles |

### Crear Usuario
```json
POST /api/usuario/crear/
{
  "usuario": "nombre_usuario",
  "pass": "contraseña",
  "rol_id": 2
}
```

### Login
```json
POST /api/usuario/login
{
  "usuario": "nombre_usuario",
  "pass": "contraseña"
}
```

## Ciudadanos

### Endpoints
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/ciudadano/listar` | Lista todos los ciudadanos activos |
| GET | `/ciudadano/listar/:codigo` | Busca ciudadano por código |
| POST | `/ciudadano/crear/` | Crea nuevo ciudadano |
| PUT | `/ciudadano/actualizar/:id` | Actualiza ciudadano |
| PUT | `/ciudadano/eliminar/:id` | Elimina ciudadano (soft delete) |

### Crear Ciudadano (Form-data)
```
POST /api/ciudadano/crear/
Content-Type: multipart/form-data

- nombre (requerido)
- apellido (requerido)
- apodo
- fechaNacimiento (YYYY-MM-DD)
- planetaOrigen
- planetaResidencia
- foto (archivo imagen, max 5MB)
- estado
```

## Archivos Estáticos
- **Códigos QR:** `/qr/{codigo}.png`
- **Fotos:** `/fotos/{nombre_archivo}`

## Respuestas

### Éxito
```json
{
  "estado": "ok",
  "mensaje": "Descripción",
  "data": { /* datos */ }
}
```

### Error
```json
{
  "estado": "Error",
  "mensaje": "Descripción del error",
  "data": null
}
```

## Características Especiales
- **Contraseñas:** Hasheadas con bcrypt
- **QR:** Generación automática con datos del ciudadano
- **Eliminación:** Soft delete (mantiene registros)
- **Archivos:** Validación de tipos y tamaños
- **CORS:** Habilitado para todas las solicitudes

## Instalación
```bash
npm install
npm start
```