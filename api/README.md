# Adoptly API

Backend REST de Adoptly, desarrollado con Node.js, TypeScript, Express, PostgreSQL y Sequelize.

## Requisitos

- Node.js y npm.
- PostgreSQL.

## Aviso de dependencia `uuid`

`npm audit` puede informar una vulnerabilidad moderada en `uuid`, una dependencia indirecta de Sequelize. El aviso afecta las funciones `v3`, `v5` y `v6` al escribir en buffers; no afecta `v4`. En las versiones instaladas para este proyecto, Sequelize usa `v1` y `v4`, y el código de Adoptly no llama directamente a `uuid`, así que no encontramos el comportamiento afectado en las rutas actuales. [Detalle del aviso](https://github.com/advisories/GHSA-w5hq-g745-h8pq).

No ejecutes `npm audit fix --force` para este aviso: npm propone bajar Sequelize a una versión principal antigua e incompatible. Revisá nuevamente la alerta cuando actualices dependencias o incorpores un uso directo de `uuid`.

## Instalacion

Desde `api/`, instala dependencias y prepara tu archivo local de configuracion:

```bash
npm install
```

Copia `.env.example` como `.env`, completa PostgreSQL y configura `JWT_SECRET` con una clave aleatoria de al menos 32 caracteres. Puedes generarla con:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Prepara las tablas siguiendo [DATABASE.md](./DATABASE.md). Luego inicia y compila:

```bash
npm run dev
npm run build
```

## Rutas implementadas

Las rutas privadas reciben el encabezado `Authorization: Bearer <token>` obtenido al registrarse o iniciar sesión.

| Metodo | Ruta | Acceso | Uso |
| --- | --- | --- | --- |
| `GET` | `/health` | Publico | Comprobar que la API responde. |
| `POST` | `/usuarios/registro` | Publico | Crear cuenta publicador o adoptante. |
| `POST` | `/usuarios/login` | Publico | Iniciar sesión y recibir token. |
| `GET` | `/usuarios/perfil` | Privado | Consultar el perfil propio. |
| `PUT` | `/usuarios/perfil` | Privado | Editar el perfil propio. |
| `GET` | `/mascotas?especie=perro` | Publico | Listar mascotas activas; filtro opcional por especie. |
| `GET` | `/mascotas/:id` | Publico | Consultar una publicación activa. |
| `GET` | `/mascotas/:id/imagenes` | Publico | Consultar las URLs de imágenes de una publicación activa. |
| `POST` | `/mascotas` | Publicador | Crear una publicación propia. |
| `POST` | `/mascotas/:id/imagenes` | Publicador propietario | Agregar una URL de imagen a su publicación. |
| `PUT` | `/mascotas/:id` | Publicador propietario | Editar todos los datos de su publicación. |
| `PATCH` | `/mascotas/:id/desactivar` | Publicador propietario | Desactivar sin borrar la publicación. |
| `POST` | `/mascotas/:id/solicitudes` | Adoptante | Enviar una solicitud si la publicación activa tiene una imagen. |

El registro público no permite crear administradores. La gestión administrativa, solicitudes y adopciones quedan para etapas futuras.

## Estructura

```text
src/
├── config/          # Conexión a PostgreSQL
├── controllers/     # Validación y respuestas HTTP
├── middlewares/     # Autenticación y permisos
├── models/          # Modelos Sequelize
├── routes/          # Rutas HTTP
├── services/        # Operaciones de datos
├── app.ts           # Configuración de Express
└── index.ts         # Inicio del servidor
```

No subas `.env` ni credenciales al repositorio. Las migraciones, seeds y tests locales están excluidos por `.gitignore`; por eso no se distribuyen comandos ni archivos de tests.
