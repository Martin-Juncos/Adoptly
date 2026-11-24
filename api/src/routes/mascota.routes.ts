/**
 * Registra las rutas HTTP relacionadas con mascotas.
 */

import { Router } from 'express';
import { desactivarMascota, editarMascota, obtenerMascotaPorId, obtenerMascotas, publicarMascota } from '../controllers/mascota.controller';
import { autenticarUsuario, requerirPublicador } from '../middlewares/auth.middleware';

const router = Router();

// GET /mascotas lista las publicaciones de mascotas activas.
router.get('/', obtenerMascotas);

// GET /mascotas/:id devuelve una publicación activa específica.
router.get('/:id', obtenerMascotaPorId);

// POST /mascotas valida y guarda una nueva mascota.
router.post('/', autenticarUsuario, requerirPublicador, publicarMascota);
router.put('/:id', autenticarUsuario, requerirPublicador, editarMascota);
router.patch('/:id/desactivar', autenticarUsuario, requerirPublicador, desactivarMascota);

export default router;
