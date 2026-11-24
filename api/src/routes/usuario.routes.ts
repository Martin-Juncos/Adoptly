/** Registra rutas de identidad, sesión y perfil propio. */

import { Router } from 'express';
import { editarPerfil, iniciarSesion, obtenerPerfil, registrar } from '../controllers/usuario.controller';
import { autenticarUsuario } from '../middlewares/auth.middleware';

const router = Router();
router.post('/registro', registrar);
router.post('/login', iniciarSesion);
router.get('/perfil', autenticarUsuario, obtenerPerfil);
router.put('/perfil', autenticarUsuario, editarPerfil);

export default router;
