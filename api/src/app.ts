/**
 * Configura y exporta la aplicación HTTP de Adoptly.
 * Las rutas y middlewares del MVP se incorporarán en los siguientes pasos.
 */

// Importa Express para crear la instancia reutilizable de la aplicación.
import express from 'express';
import mascotasRouter from './routes/mascota.routes';

// Crea la aplicación que utilizará el punto de entrada y las pruebas.
const app = express();

// Habilita el envío de cuerpos JSON y registra las rutas del recurso mascotas.
app.use(express.json());
app.use('/mascotas', mascotasRouter);

// Responde a las comprobaciones de disponibilidad con un estado simple de la API.
app.get('/health', (_request, response) => {
  response.status(200).json({ status: 'ok' });
});

// Exporta la aplicación sin abrir un puerto, facilitando su reutilización y prueba.
export default app;
