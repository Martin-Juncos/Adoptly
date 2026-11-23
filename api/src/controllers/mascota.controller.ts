/**
 * Adapta las consultas HTTP de mascotas a las operaciones del servicio.
 */

import { Request, Response, NextFunction } from 'express';
import { listarMascotas } from '../services/mascota.service';

// Devuelve al cliente la lista de publicaciones activas en formato JSON.
export async function obtenerMascotas(
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const mascotas = await listarMascotas();
    response.status(200).json(mascotas);
  } catch (error) {
    next(error);
  }
}
