# Recorrido del código de Adoptly

Esta guía sirve para seguir una petición desde que llega a la API hasta que se guarda o consulta en PostgreSQL. La idea es leer las piezas en orden y entender qué responsabilidad tiene cada una, sin agregar capas nuevas.

## 1. Cómo viaja una petición

```text
Thunder Client
      ↓ HTTP
src/app.ts → src/routes/ → middleware (si corresponde)
      ↓
controller → service → model Sequelize → PostgreSQL
      ↑
respuesta JSON ← controller ← resultado del service
```

- **`app.ts`** crea Express, permite leer JSON con `express.json()` y conecta los routers. Por ejemplo, todo lo que se registra con `app.use('/mascotas', mascotasRouter)` empieza con `/mascotas`.
- **`routes/`** relaciona método y camino HTTP con una función. También indica qué middleware debe ejecutarse antes.
- **Middleware** puede detener la petición si falta el token o el rol no corresponde. Si todo está bien, llama a `next()` para que continúe.
- **Controller** lee los datos de `request.params`, `request.query` o `request.body`, valida lo básico y decide el código HTTP y el JSON de respuesta.
- **Service** aplica las reglas del negocio y consulta o modifica datos.
- **Model** representa una tabla de PostgreSQL y ofrece operaciones de Sequelize como `findOne`, `findAll`, `create` y `update`.

`src/index.ts` es el punto de entrada: carga la configuración, comprueba el secreto JWT, verifica la conexión a PostgreSQL y recién entonces empieza a escuchar en el puerto.

## 2. Rutas disponibles y permisos

Las rutas privadas esperan `Authorization: Bearer <token>`. Los tokens se obtienen al registrarse o iniciar sesión. El registro público permite crear publicadores y adoptantes, pero no administradores.

| Método y ruta | Quién puede usarla | Qué hace | Respuesta exitosa |
| --- | --- | --- | --- |
| `GET /health` | Cualquiera | Comprueba que la API responde. | `200` |
| `POST /usuarios/registro` | Público | Registra un publicador o adoptante. | `201` |
| `POST /usuarios/login` | Público | Inicia sesión y devuelve un token. | `200` |
| `GET /usuarios/perfil` | Usuario autenticado | Devuelve el perfil propio. | `200` |
| `PUT /usuarios/perfil` | Usuario autenticado | Actualiza el perfil propio. | `200` |
| `GET /adopciones/mias` | Adoptante autenticado | Lista sus adopciones con datos básicos de cada mascota. | `200` |
| `GET /mascotas` | Cualquiera | Lista publicaciones activas; acepta `?especie=perro` o `?especie=gato`. | `200` |
| `GET /mascotas/:id` | Cualquiera | Consulta una publicación activa. | `200` |
| `POST /mascotas` | Publicador autenticado | Publica una mascota propia. | `201` |
| `PUT /mascotas/:id` | Publicador dueño | Edita todos los datos de su publicación. | `200` |
| `PATCH /mascotas/:id/desactivar` | Publicador dueño | Desactiva su publicación sin borrarla. | `200` |
| `GET /mascotas/:id/imagenes` | Cualquiera | Consulta las URLs de imágenes de una publicación activa. | `200` |
| `POST /mascotas/:id/imagenes` | Publicador dueño | Agrega una URL de imagen. | `201` |
| `PUT /mascotas/:id/imagenes/:imagenId` | Publicador dueño | Corrige una URL de su publicación. | `200` |
| `DELETE /mascotas/:id/imagenes/:imagenId` | Publicador dueño | Elimina una imagen de su publicación. | `200` |
| `POST /mascotas/:id/solicitudes` | Adoptante autenticado | Envía una solicitud para esa mascota. | `201` |
| `GET /solicitudes/mias` | Adoptante autenticado | Consulta solo las solicitudes que envió. | `200` |
| `GET /mascotas/:id/solicitudes` | Publicador dueño | Consulta las solicitudes de su publicación. | `200` |
| `PATCH /solicitudes/:id/resolver` | Publicador dueño | Acepta o rechaza una solicitud pendiente. | `200` |

### Cómo interpretar otros códigos

- **`400`**: falta un dato o su formato/valor no es válido; por ejemplo, un ID que no es positivo o una especie distinta de `perro` o `gato`.
- **`401`**: falta el token, no es válido o la cuenta está desactivada.
- **`403`**: el token es válido, pero el rol no puede hacer esa operación. Por ejemplo, un adoptante intenta publicar.
- **`404`**: no existe el recurso, no está activo o pertenece a otro publicador. La API no revela recursos privados ajenos.
- **`409`**: la operación choca con el estado actual; por ejemplo, solicitud duplicada, mascota sin imagen o ya adoptada.

## 3. Seguir el flujo principal en el código

### A. Publicador: publicar una mascota

1. En `src/routes/mascota.routes.ts`, `POST /` conecta la ruta con `autenticarUsuario`, `requerirPublicador` y `publicarMascota`. Como el router ya está montado bajo `/mascotas`, la ruta completa es `POST /mascotas`.
2. `autenticarUsuario` lee el Bearer token, comprueba su firma y busca que la cuenta siga activa. Si pasa, agrega el ID y el rol a `request.usuario`.
3. `requerirPublicador` deja pasar solo el rol publicador. Si no es el rol correcto, responde `403` y no llama al controller.
4. `publicarMascota` en `src/controllers/mascota.controller.ts` valida los campos y toma el ID del publicador desde `request.usuario`; no confía en un `publicador_id` enviado en el JSON.
5. El controller llama a `crearMascota` en `src/services/mascota.service.ts`. El service crea el registro usando el modelo `Mascota`.
6. Si se creó, el controller responde `201` con la mascota. Si el cuerpo no es válido, responde `400`.

### B. Publicador: agregar una imagen

1. `POST /mascotas/:id/imagenes` vuelve a comprobar token y rol de publicador.
2. `agregarImagen` en `imagen-mascota.controller.ts` valida el ID y que `url_imagen` sea una URL HTTP o HTTPS válida.
3. Llama a `agregarImagenPropia` en `imagen-mascota.service.ts`. El service comprueba que la mascota esté activa y que pertenezca al publicador del token; después crea la fila `ImagenMascota`.
4. Si se agregó, responde `201`. Si el publicador no es dueño, no existe la mascota activa o la URL no sirve, devuelve el error correspondiente.

### C. Adoptante: enviar una solicitud

1. `POST /mascotas/:id/solicitudes` exige token válido y rol adoptante.
2. `enviarSolicitud` en `solicitud.controller.ts` valida los datos del formulario. La identidad del adoptante sale del token, no del JSON.
3. `crearSolicitud` en `solicitud.service.ts` comprueba que la mascota esté activa, no adoptada, tenga al menos una imagen y que ese adoptante no haya enviado otra solicitud para ella.
4. Esas comprobaciones y la creación se hacen dentro de una transacción. Si todo está bien, guarda una solicitud `pendiente` y cambia la mascota a `con_solicitudes_pendientes`.
5. La API responde `201` con la solicitud. Si ya existe, no tiene imagen o la mascota fue adoptada, responde `409`.

### D. Consultar y resolver solicitudes

- `GET /solicitudes/mias` pasa por autenticación y rol adoptante; el service filtra por el ID del adoptante autenticado.
- `GET /mascotas/:id/solicitudes` pasa por autenticación y rol publicador; el service confirma que la mascota le pertenezca antes de listar.
- `PATCH /solicitudes/:id/resolver` permite al publicador dueño enviar `{"decision":"aceptar"}` o `{"decision":"rechazar","motivo_rechazo":"Motivo breve"}`. El motivo es obligatorio para rechazar.

La resolución está en `resolverSolicitud` de `solicitud.service.ts` y ocurre en una transacción:

- **Aceptar:** la solicitud queda `aceptada`, la mascota queda `adoptada`, se crea un registro en el modelo `Adopcion` y las demás solicitudes pendientes se rechazan. La respuesta `200` incluye `solicitud`, `adopcion` y cuántas solicitudes se rechazaron.
- **Rechazar:** la solicitud queda `rechazada` y guarda el motivo. Si era la última pendiente, la mascota vuelve a `disponible`; si todavía quedan pendientes, mantiene ese estado. La respuesta es `200`.

No hay una ruta `POST /adopciones`: el registro de adopción se crea como parte de aceptar la solicitud.

Una vez creada, el adoptante consulta su historial con `GET /adopciones/mias`. La ruta usa los mismos pasos de autenticación y rol adoptante que `GET /solicitudes/mias`; el controller toma el ID del token y el service busca solo registros con ese `adoptante_id`.

## 4. Modelos y archivos para leer

| Archivo o carpeta | Para qué sirve |
| --- | --- |
| `src/app.ts` y `src/index.ts` | Configuración de Express y arranque del servidor. |
| `src/routes/` | Caminos HTTP y middlewares asociados. |
| `src/middlewares/auth.middleware.ts` | Validación de token y permisos por rol. |
| `src/controllers/` | Validación de entrada y respuestas HTTP. |
| `src/services/` | Reglas del negocio y consultas. |
| `src/models/` | Forma de las tablas y relaciones Sequelize. |
| `src/routes/adopcion.routes.ts`, `src/controllers/adopcion.controller.ts`, `src/services/adopcion.service.ts` | Ruta de consulta y lectura de adopciones propias. |
| `src/config/database.ts` | Conexión a PostgreSQL; no crea las tablas automáticamente. |
| `DATABASE.md` | Cómo preparar la base local y qué reglas representan sus tablas. |


