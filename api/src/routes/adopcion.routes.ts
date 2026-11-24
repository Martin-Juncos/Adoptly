/** Registra las rutas para consultar adopciones propias. */

import { Router } from 'express';
import { obtenerMisAdopciones } from '../controllers/adopcion.controller';
import { autenticarUsuario, requerirAdoptante } from '../middlewares/auth.middleware';

const router = Router();

// Cada adoptante autenticado consulta únicamente sus propias adopciones.
router.get('/mias', autenticarUsuario, requerirAdoptante, obtenerMisAdopciones);

export default router;
