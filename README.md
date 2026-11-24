# Adoptly

API REST para conectar a personas que quieren adoptar mascotas con refugios, rescatistas y particulares. El repositorio contiene el backend y una carpeta reservada para el frontend.

## Estado actual

El backend implementa los flujos principales del MVP:

- Registro de publicadores y adoptantes, inicio de sesión y consulta/edición del perfil.
- Publicaciones de mascotas: listado, detalle, filtro por especie, creación, edición y desactivación.
- Administración de URLs de imágenes por el publicador propietario.
- Solicitudes de adopción: envío por adoptantes, consulta y resolución por el publicador propietario.
- Registro de adopción al aceptar una solicitud. La mascota queda adoptada y las demás solicitudes pendientes se rechazan.

El alta pública no permite crear cuentas de administrador. Las operaciones privadas requieren un token y los publicadores solo pueden gestionar sus propios recursos.

## Tecnologías

- **API:** Node.js, TypeScript, Express 5.
- **Base de datos:** PostgreSQL y Sequelize 6.
- **Autenticación:** JWT y bcrypt.
- **Frontend:** carpeta `client/` reservada para la interfaz; consultar [`client/README.md`](client/README.md) para su estado.

## Estructura

```text
Adoptly/
├── api/
│   ├── src/
│   │   ├── config/       # Conexión a PostgreSQL
│   │   ├── controllers/  # Validación y respuestas HTTP
│   │   ├── middlewares/  # Autenticación
│   │   ├── models/       # Modelos y relaciones
│   │   ├── routes/       # Rutas HTTP
│   │   ├── services/     # Reglas y operaciones de datos
│   │   ├── app.ts        # Configuración de Express y rutas
│   │   └── index.ts      # Inicio del servidor
│   ├── .env.example
│   ├── DATABASE.md       # Preparación y reglas de la base local
│   └── README.md         # Rutas y uso de la API
└── client/
    └── README.md
```

## Empezar con el backend

1. Instalá Node.js, npm y PostgreSQL.
2. Desde `api/`, instalá las dependencias:

   ```bash
   npm install
   ```

3. Copiá `api/.env.example` como `api/.env` y completá la configuración local. Generá un `JWT_SECRET` aleatorio de al menos 32 caracteres. No compartas ni subas `.env`.
4. Prepará la base de datos siguiendo [`api/DATABASE.md`](api/DATABASE.md).
5. Desde `api/`, iniciá el servidor de desarrollo y comprobá `http://localhost:3000/health`:

   ```bash
   npm run dev
   ```

6. Para compilar TypeScript:

   ```bash
   npm run build
   ```

La referencia de endpoints, permisos y flujo de adopción está en [`api/README.md`](api/README.md).

## Documentación

- [API: rutas, permisos y recorrido de adopción](api/README.md)
- [Base de datos: configuración, tablas y reglas](api/DATABASE.md)
- [Frontend: estado actual](client/README.md)
