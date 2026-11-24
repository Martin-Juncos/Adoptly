/** Registra las rutas para consultar y resolver solicitudes de adopción. */

import { Router } from 'express';
import { obtenerMisSolicitudes, resolverSolicitud } from '../controllers/solicitud.controller';
import { autenticarUsuario, requerirAdoptante, requerirPublicador } from '../middlewares/auth.middleware';

const router = Router();

// El adoptante autenticado solo puede ver las solicitudes que envió.
router.get('/mias', autenticarUsuario, requerirAdoptante, obtenerMisSolicitudes);

// El publicador dueño de la mascota puede resolver su solicitud.
router.patch('/:id/resolver', autenticarUsuario, requerirPublicador, resolverSolicitud);

export default router;
