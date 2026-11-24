/** Adapta la consulta de adopciones propias a una respuesta HTTP. */

import { NextFunction, Request, Response } from 'express';
import { listarAdopcionesDelAdoptante } from '../services/adopcion.service';

// Devuelve las adopciones asociadas al adoptante autenticado.
export async function obtenerMisAdopciones(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const adopciones = await listarAdopcionesDelAdoptante(request.usuario!.id);
    response.status(200).json(adopciones);
  } catch (error) {
    next(error);
  }
}
