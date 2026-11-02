# 🐾 Adoptly — Backend

API REST que conecta a personas que desean adoptar mascotas con refugios, rescatistas y particulares. Permite publicar animales, buscar por características y gestionar solicitudes de adopción.

## Objetivo

Facilitar la búsqueda de un hogar para animales en adopción y centralizar la gestión de publicaciones y solicitudes.

## Alcance del MVP

Esta primera etapa contempla únicamente el backend. La interfaz de usuario se desarrollará en una fase posterior.

### Funcionalidades previstas

- Registro e inicio de sesión.
- Autenticación y autorización por roles.
- Gestión de perfiles de publicadores: refugio, rescatista o particular.
- Creación, consulta, edición y baja de publicaciones de mascotas.
- Registro de fotografías mediante referencias o URLs.
- Búsqueda pública con filtros por especie, ubicación, tamaño y edad.
- Paginación de resultados.
- Envío de solicitudes de adopción mediante un formulario.
- Aceptación o rechazo de solicitudes por parte del publicador, con registro del motivo.
- Consulta del estado de cada mascota.
- Registro básico de auditoría.

## Roles

| Rol | Responsabilidades |
| --- | --- |
| Administrador | Administrar cuentas y estados de publicaciones. |
| Publicador | Gestionar sus mascotas y resolver las solicitudes recibidas. |
| Adoptante | Buscar mascotas y enviar solicitudes de adopción. |

Los permisos deben verificarse en la API. Cada publicador solo puede gestionar sus propias publicaciones y solicitudes.

## Estados de una mascota

| Estado | Descripción |
| --- | --- |
| Disponible | Puede recibir solicitudes y no tiene solicitudes pendientes. |
| Con solicitudes pendientes | Tiene al menos una solicitud pendiente de resolución. |
| Adoptada | La adopción fue registrada y la mascota deja de recibir solicitudes. |

La aceptación de una solicitud y el registro de la adopción deben realizarse de forma consistente para evitar que una mascota sea asignada a más de un adoptante.

## Tecnologías

- **Node.js:** entorno de ejecución.
- **Express:** servidor y API REST.
- **PostgreSQL:** base de datos relacional.
- **Sequelize:** modelos, relaciones y migraciones.
- **Jest y Supertest:** pruebas de integración.
- **OpenAPI / Swagger:** documentación de la API.

## Organización propuesta

```text
api/
├── src/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── middlewares/
│   ├── validators/
│   ├── app.js
│   └── server.js
├── migrations/
├── seeders/
├── tests/
├── docs/
├── .env.example
└── package.json
```

Esta estructura es una propuesta inicial y puede ajustarse durante la implementación.

## Modelo de datos

Entidades principales previstas:

- **Usuario:** credenciales, rol y estado de cuenta.
- **Perfil de publicador:** información del refugio, rescatista o particular.
- **Mascota:** características, ubicación, publicador y estados de adopción y publicación.
- **Foto de mascota:** referencias a las imágenes.
- **Solicitud de adopción:** formulario, adoptante, mascota, estado y motivo de resolución.
- **Adopción:** vínculo entre mascota, adoptante, publicador y solicitud aceptada.
- **Registro de auditoría:** acciones relevantes realizadas en el sistema.

La entidad **Adopción** permitirá incorporar seguimiento posadopción en el futuro sin depender únicamente del estado de la mascota.

## Seguridad y validaciones

La API deberá contemplar:

- Validación de entradas y parámetros de búsqueda.
- Almacenamiento seguro de contraseñas mediante hash.
- Autorización por rol y propiedad del recurso.
- Manejo centralizado de errores.
- Limitación de solicitudes mediante rate limiting.
- Configuración de CORS.
- Protección de credenciales mediante variables de entorno.
- Exclusión de contraseñas y datos sensibles de respuestas y registros.
- Transacciones para operaciones críticas del proceso de adopción.

## Instalación y ejecución

> Los comandos definitivos se documentarán cuando estén configurados los scripts del proyecto.

Pasos generales:

1. Clonar el repositorio.
2. Instalar las dependencias del backend.
3. Crear el archivo `.env` tomando como referencia `.env.example`.
4. Configurar la conexión a PostgreSQL.
5. Ejecutar las migraciones.
6. Iniciar el servidor.

El archivo `.env` no debe subirse al repositorio.

## Pruebas

Se utilizarán **Jest y Supertest** para verificar especialmente:

- Autenticación y permisos por rol.
- Restricciones de acceso a recursos de otros usuarios.
- Validación de formularios y filtros.
- Aceptación y rechazo de solicitudes.
- Transiciones de estado de las mascotas.
- Prevención de adopciones duplicadas.
- Consistencia de las operaciones sobre la base de datos.

Las pruebas deberán ejecutarse sobre una base de datos independiente de producción.

## Documentación de la API

Los endpoints se documentarán con **OpenAPI / Swagger**, incluyendo:

- Métodos y rutas.
- Requisitos de autenticación.
- Parámetros y cuerpos de las solicitudes.
- Ejemplos de respuestas.
- Códigos de estado y errores.

## Integración continua

El pipeline mínimo ejecutará:

```text
Lint → Tests → Build o validación de construcción
```

El paso de construcción se ajustará a la configuración del backend.

## Futuras etapas

Las siguientes funcionalidades quedan fuera del MVP actual:

- Frontend.
- Mensajería interna y notificaciones.
- Favoritos y alertas.
- Seguimiento posadopción.
- Consentimiento mutuo para compartir avances.
- Pagos y donaciones.
- Moderación avanzada y denuncias.

El seguimiento posadopción podría permitir registrar adaptación, controles veterinarios y fotografías. El publicador podrá consultar esos avances únicamente si ambas partes aceptan participar.

## Estado del proyecto

En planificación y desarrollo del backend del MVP. Las funcionalidades descritas representan el alcance previsto y no implican que ya estén implementadas.