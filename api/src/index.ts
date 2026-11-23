/**
 * Punto de entrada del backend Adoptly.
 * Carga las variables de entorno e inicia la aplicación HTTP en el puerto configurado.
 */

// Carga api/.env antes de importar módulos que puedan depender de la configuración.
import 'dotenv/config';

// Importa la aplicación Express configurada para el backend.
import app from './app';

// Obtiene el puerto del entorno o utiliza 3000 para desarrollo local.
const port = Number(process.env.PORT) || 3000;

// Inicia el servidor y registra la dirección donde quedó escuchando.
function startServer(): void {
  app.listen(port, () => {
    console.log(`Servidor Adoptly escuchando en http://localhost:${port}`);
  });
}

// Ejecuta el servidor al iniciar el punto de entrada.
startServer();
