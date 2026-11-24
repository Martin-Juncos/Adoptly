/** Verifica tokens Bearer y carga la cuenta activa asociada al token. */

import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Usuario } from '../models/usuario.model';

interface TokenUsuario { sub: string }

function obtenerSecreto(): string {
  const secreto = process.env.JWT_SECRET;
  if (!secreto || secreto.length < 32) throw new Error('JWT_SECRET debe tener al menos 32 caracteres.');
  return secreto;
}

// Valida la configuración de tokens al iniciar el backend, no en la primera petición.
export function comprobarConfiguracionAutenticacion(): void {
  obtenerSecreto();
}

// Solo acepta tokens firmados con HS256 y devuelve 401 ante credenciales inválidas.
export async function autenticarUsuario(request: Request, response: Response, next: NextFunction): Promise<void> {
  const authorization = request.get('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) {
    response.status(401).json({ error: 'Iniciá sesión para realizar esta acción.' });
    return;
  }

  try {
    const claims = jwt.verify(token, obtenerSecreto(), { algorithms: ['HS256'] }) as TokenUsuario;
    const id = Number(claims.sub);
    if (!Number.isSafeInteger(id) || id < 1) throw new Error('Token inválido.');
    const usuario = await Usuario.findOne({ where: { id, activo: true } });
    if (!usuario) {
      response.status(401).json({ error: 'La sesión no es válida.' });
      return;
    }
    request.usuario = { id: usuario.id, rol: usuario.rol };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      response.status(401).json({ error: 'La sesión no es válida.' });
      return;
    }
    next(error);
  }
}

// Evita que adoptantes u otros roles publiquen mascotas.
export function requerirPublicador(request: Request, response: Response, next: NextFunction): void {
  if (request.usuario?.rol !== 'publicador') {
    response.status(403).json({ error: 'Solo un publicador puede gestionar mascotas.' });
    return;
  }
  next();
}

// Expide token corto de acceso; el servidor vuelve a consultar la cuenta activa en cada petición.
export function crearTokenUsuario(id: number): string {
  return jwt.sign({}, obtenerSecreto(), { subject: String(id), expiresIn: '2h', algorithm: 'HS256' });
}
