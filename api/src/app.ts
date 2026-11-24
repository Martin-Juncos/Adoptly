/**
 * Configura y exporta la aplicación HTTP de Adoptly.
 * Registra los routers de cada módulo y no abre el puerto del servidor.
 */

// Importa Express para crear la instancia reutilizable de la aplicación.
import express from 'express';
import adopcionesRouter from './routes/adopcion.routes';
import mascotasRouter from './routes/mascota.routes';
import usuariosRouter from './routes/usuario.routes';
import solicitudesRouter from './routes/solicitud.routes';

// Crea la aplicación que utilizará el punto de entrada y las pruebas.
const app = express();

// Habilita el envío de cuerpos JSON y conecta las rutas de la API.
app.use(express.json());
app.use('/adopciones', adopcionesRouter);
app.use('/mascotas', mascotasRouter);
app.use('/usuarios', usuariosRouter);
app.use('/solicitudes', solicitudesRouter);

// Responde a las comprobaciones de disponibilidad con un estado simple de la API.
app.get('/health', (_request, response) => {
  response.status(200).json({ status: 'ok' });
});

// Exporta la aplicación sin abrir un puerto, facilitando su reutilización y prueba.
export default app;
