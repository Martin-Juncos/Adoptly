/**
 * Registra las rutas HTTP relacionadas con mascotas.
 */

import { Router } from 'express';
import { desactivarMascota, editarMascota, obtenerMascotaPorId, obtenerMascotas, publicarMascota } from '../controllers/mascota.controller';
import { agregarImagen, obtenerImagenes } from '../controllers/imagen-mascota.controller';
import { enviarSolicitud } from '../controllers/solicitud.controller';
import { autenticarUsuario, requerirAdoptante, requerirPublicador } from '../middlewares/auth.middleware';

const router = Router();

// GET /mascotas lista las publicaciones de mascotas activas.
router.get('/', obtenerMascotas);

// GET /mascotas/:id devuelve una publicación activa específica.
router.get('/:id', obtenerMascotaPorId);

// POST /mascotas valida y guarda una nueva mascota.
router.post('/', autenticarUsuario, requerirPublicador, publicarMascota);
router.put('/:id', autenticarUsuario, requerirPublicador, editarMascota);
router.patch('/:id/desactivar', autenticarUsuario, requerirPublicador, desactivarMascota);
// El público puede ver URLs de imágenes de publicaciones activas.
router.get('/:id/imagenes', obtenerImagenes);
// Solo el dueño de una publicación activa puede agregarle una imagen.
router.post('/:id/imagenes', autenticarUsuario, requerirPublicador, agregarImagen);
// Solo adoptantes autenticados pueden solicitar una mascota.
router.post('/:id/solicitudes', autenticarUsuario, requerirAdoptante, enviarSolicitud);

export default router;
