/**
 * Punto de entrada del backend Adoptly.
 * Carga las variables de entorno e inicia la aplicación HTTP en el puerto configurado.
 */

// Carga api/.env antes de importar módulos que puedan depender de la configuración.
import 'dotenv/config';

// Importa la aplicación Express configurada para el backend.
import app from './app';
import { testDatabaseConnection } from './config/database';

// Obtiene el puerto del entorno o utiliza 3000 para desarrollo local.
const port = Number(process.env.PORT) || 3000;

// Comprueba la base antes de aceptar peticiones e inicia el servidor HTTP.
async function startServer(): Promise<void> {
  await testDatabaseConnection();
  console.log('Conexión con PostgreSQL establecida.');

  app.listen(port, () => {
    console.log(`Servidor Adoptly escuchando en http://localhost:${port}`);
  });
}

// Ejecuta el servidor al iniciar el punto de entrada.
startServer().catch((error: unknown) => {
  console.error('No se pudo iniciar Adoptly:', error);
  process.exitCode = 1;
});
