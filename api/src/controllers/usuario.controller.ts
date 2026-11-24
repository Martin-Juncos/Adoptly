/** Recibe y valida las solicitudes de registro, login y perfil. */

import { Request, Response, NextFunction } from 'express';
import { crearTokenUsuario } from '../middlewares/auth.middleware';
import { RolUsuario, TipoPublicador, Usuario } from '../models/usuario.model';
import { actualizarPerfil, DatosPerfil, DatosRegistro, perfilPublico, registrarUsuario, validarCredenciales } from '../services/auth.service';

const ROLES_REGISTRABLES: Array<Exclude<RolUsuario, 'administrador'>> = ['publicador', 'adoptante'];
const TIPOS_PUBLICADOR: TipoPublicador[] = ['refugio', 'rescatista', 'particular'];

// Comprueba que un cuerpo JSON sea un objeto y no un arreglo o valor primitivo.
function esObjeto(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Valida texto obligatorio y el límite de caracteres definido por el modelo.
function textoValido(value: unknown, maximo: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maximo;
}

// Registra publicadores o adoptantes; el rol administrador nunca se acepta públicamente.
export async function registrar(request: Request, response: Response, next: NextFunction): Promise<void> {
  const body = request.body;
  if (!esObjeto(body)
    || !textoValido(body.nombre_completo, 150)
    || !textoValido(body.email, 254)
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email))
    || typeof body.password !== 'string' || body.password.length < 8 || Buffer.byteLength(body.password, 'utf8') > 72
    || !ROLES_REGISTRABLES.includes(body.rol as Exclude<RolUsuario, 'administrador'>)) {
    response.status(400).json({ error: 'Completá nombre, email válido, contraseña (mínimo 8 caracteres y hasta 72 bytes) y rol publicador o adoptante.' });
    return;
  }
  if (body.telefono !== undefined && body.telefono !== null && (typeof body.telefono !== 'string' || body.telefono.length > 30)) {
    response.status(400).json({ error: 'El teléfono debe ser texto de hasta 30 caracteres.' }); return;
  }
  if (body.descripcion !== undefined && body.descripcion !== null && typeof body.descripcion !== 'string') {
    response.status(400).json({ error: 'La descripción debe ser texto o null.' }); return;
  }
  const rol = body.rol as DatosRegistro['rol'];
  if (rol === 'publicador' && !TIPOS_PUBLICADOR.includes(body.tipo_publicador as TipoPublicador)) {
    response.status(400).json({ error: 'El tipo_publicador debe ser refugio, rescatista o particular.' }); return;
  }

  try {
    const usuario = await registrarUsuario({
      nombre_completo: body.nombre_completo.trim(), email: body.email.trim().toLowerCase(), password: body.password,
      rol, tipo_publicador: rol === 'publicador' ? body.tipo_publicador as TipoPublicador : null,
      telefono: body.telefono as string | null | undefined, descripcion: body.descripcion as string | null | undefined,
    });
    response.status(201).json({ usuario: perfilPublico(usuario), token: crearTokenUsuario(usuario.id) });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'SequelizeUniqueConstraintError') {
      response.status(409).json({ error: 'Ya existe una cuenta con ese email.' }); return;
    }
    next(error);
  }
}

// Comprueba credenciales y devuelve un token si la cuenta está activa.
export async function iniciarSesion(request: Request, response: Response, next: NextFunction): Promise<void> {
  const { email, password } = request.body ?? {};
  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    response.status(400).json({ error: 'Ingresá email y contraseña.' }); return;
  }
  try {
    const usuario = await validarCredenciales(email, password);
    if (!usuario) { response.status(401).json({ error: 'Email o contraseña incorrectos.' }); return; }
    response.status(200).json({ usuario: perfilPublico(usuario), token: crearTokenUsuario(usuario.id) });
  } catch (error) { next(error); }
}

// Devuelve el perfil asociado a la sesión actual.
export async function obtenerPerfil(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const usuario = await Usuario.findByPk(request.usuario!.id);
    if (!usuario || !usuario.activo) { response.status(401).json({ error: 'La sesión no es válida.' }); return; }
    response.status(200).json(perfilPublico(usuario));
  } catch (error) { next(error); }
}

// Actualiza solo los campos editables del perfil propio.
export async function editarPerfil(request: Request, response: Response, next: NextFunction): Promise<void> {
  const body = request.body;
  if (!esObjeto(body) || !textoValido(body.nombre_completo, 150)) {
    response.status(400).json({ error: 'El nombre_completo es obligatorio y admite hasta 150 caracteres.' }); return;
  }
  if (body.telefono !== undefined && body.telefono !== null && (typeof body.telefono !== 'string' || body.telefono.length > 30)) {
    response.status(400).json({ error: 'El teléfono debe ser texto de hasta 30 caracteres.' }); return;
  }
  if (body.descripcion !== undefined && body.descripcion !== null && typeof body.descripcion !== 'string') {
    response.status(400).json({ error: 'La descripción debe ser texto o null.' }); return;
  }
  if (body.tipo_publicador !== undefined && body.tipo_publicador !== null && !TIPOS_PUBLICADOR.includes(body.tipo_publicador as TipoPublicador)) {
    response.status(400).json({ error: 'El tipo_publicador debe ser refugio, rescatista o particular.' }); return;
  }
  try {
    const perfil = await actualizarPerfil(request.usuario!.id, body as unknown as DatosPerfil);
    if (!perfil) { response.status(404).json({ error: 'No se encontró el perfil.' }); return; }
    response.status(200).json(perfilPublico(perfil));
  } catch (error) { next(error); }
}
