/**
 * Configura y exporta la aplicación HTTP de Adoptly.
 * Las rutas y middlewares del MVP se incorporarán en los siguientes pasos.
 */

// Importa Express para crear la instancia reutilizable de la aplicación.
import express from 'express';

// Crea la aplicación que utilizará el punto de entrada y las pruebas.
const app = express();

// Exporta la aplicación sin abrir un puerto, facilitando su reutilización y prueba.
export default app;
