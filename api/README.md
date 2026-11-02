# Adoptly API 🐾

Backend de Adoptly, una aplicación que conecta a personas que desean adoptar mascotas con refugios, rescatistas y particulares.

## Tecnologías

- Node.js
- Express
- PostgreSQL
- Sequelize

## Funcionalidades

- Registro e inicio de sesión.
- Acceso por roles: Administrador, Publicador y Adoptante.
- Gestión de perfiles de publicadores.
- Publicación y edición de mascotas con referencias a fotografías.
- Búsqueda de mascotas con filtros y paginación.
- Envío de solicitudes de adopción.
- Aceptación o rechazo de solicitudes.
- Actualización del estado de las mascotas.

## Estructura del backend

El backend se organiza como una aplicación monolítica: todas las funcionalidades forman parte de un mismo servidor Express y utilizan una misma base de datos.

```text
api/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   └── app.js
├── .env.example
├── .gitignore
├── index.js
├── package.json
└── README.md
```

| Archivo o carpeta | Responsabilidad |
| --- | --- |
| `src/config/database.js` | Configurar la conexión a PostgreSQL mediante Sequelize. |
| `src/models/` | Definir los modelos y sus relaciones. |
| `src/controllers/` | Resolver las solicitudes y aplicar las reglas de negocio. |
| `src/routes/` | Definir los endpoints y conectarlos con sus controladores. |
| `src/middlewares/` | Validar datos, verificar autenticación y permisos, y manejar errores. |
| `src/app.js` | Configurar Express, los middlewares y las rutas. |
| `index.js` | Conectar con la base de datos e iniciar el servidor. |
| `.env.example` | Mostrar las variables de entorno necesarias, sin credenciales reales. |

## Modelo de datos

Las entidades principales serán:

- **Usuario:** datos de acceso, rol y estado de cuenta.
- **PerfilPublicador:** información del refugio, rescatista o particular.
- **Mascota:** características, fotografías, ubicación y estado.
- **SolicitudAdopcion:** formulario enviado por el adoptante y resolución del publicador.
- **Adopcion:** relación entre la mascota, el adoptante y el publicador.

La entidad `Adopcion` permitirá incorporar seguimiento posadopción en una etapa futura.

## Configuración local

1. Ingresar a la carpeta `api`.
2. Instalar las dependencias con `npm install`.
3. Crear una base de datos en PostgreSQL.
4. Crear el archivo `.env` tomando como referencia `.env.example`.
5. Configurar la conexión a la base de datos.
6. Iniciar el servidor con el script definido en `package.json`.

### Variables de entorno

```dotenv
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=adoptly
DB_USER=postgres
DB_PASSWORD=replace_me
```

Durante el desarrollo, las tablas podrán crearse a partir de los modelos mediante `sequelize.sync()`. Los cambios posteriores deberán revisarse para evitar pérdida de datos.

El archivo `.env` debe incluirse en `.gitignore`.

## Reglas principales

- Cada publicador administra únicamente sus mascotas y las solicitudes recibidas para ellas.
- Cada adoptante puede consultar sus propias solicitudes.
- Las mascotas pueden estar disponibles, con solicitudes pendientes o adoptadas.
- Una mascota adoptada no recibe nuevas solicitudes.
- La aceptación de una solicitud debe registrar la adopción y actualizar la mascota mediante una transacción.
- Las contraseñas deben almacenarse mediante hash y los permisos deben verificarse en el servidor.

## Estado del proyecto

En desarrollo. Las funcionalidades descritas se incorporarán progresivamente.