/**
 * Registra las rutas HTTP relacionadas con mascotas.
 */

import { Router } from 'express';
import { obtenerMascotas } from '../controllers/mascota.controller';

const router = Router();

// GET /mascotas lista las publicaciones de mascotas activas.
router.get('/', obtenerMascotas);

export default router;
