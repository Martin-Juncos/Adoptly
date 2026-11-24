/** Valida y responde las solicitudes para imágenes asociadas a mascotas. */

import { NextFunction, Request, Response } from 'express';
import { agregarImagenPropia, listarImagenesPublicas } from '../services/imagen-mascota.service';

function leerIdPositivo(idTexto: unknown): number | null {
  if (typeof idTexto !== 'string' || !/^\d+$/.test(idTexto) || Number(idTexto) < 1) return null;
  return Number(idTexto);
}

// Guarda una URL de imagen en una publicación del publicador autenticado.
export async function agregarImagen(request: Request, response: Response, next: NextFunction): Promise<void> {
  const mascotaId = leerIdPositivo(request.params.id);
  if (!mascotaId) { response.status(400).json({ error: 'El ID de mascota debe ser un entero positivo.' }); return; }

  const body = request.body;
  if (!body || typeof body !== 'object' || Array.isArray(body) || typeof body.url_imagen !== 'string' || !body.url_imagen.trim()) {
    response.status(400).json({ error: 'Enviá url_imagen como texto.' }); return;
  }
  const urlImagen = body.url_imagen.trim();
  if (urlImagen.length > 2048) { response.status(400).json({ error: 'La URL no puede superar 2048 caracteres.' }); return; }
  try {
    const url = new URL(urlImagen);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) {
      response.status(400).json({ error: 'La URL debe usar http o https y no contener credenciales.' }); return;
    }
  } catch {
    response.status(400).json({ error: 'Ingresá una URL válida de imagen.' }); return;
  }

  try {
    const imagen = await agregarImagenPropia(mascotaId, request.usuario!.id, urlImagen);
    if (!imagen) { response.status(404).json({ error: 'No se encontró una publicación activa propia con ese ID.' }); return; }
    response.status(201).json(imagen);
  } catch (error) { next(error); }
}

// Devuelve las imágenes de una publicación activa disponible públicamente.
export async function obtenerImagenes(request: Request, response: Response, next: NextFunction): Promise<void> {
  const mascotaId = leerIdPositivo(request.params.id);
  if (!mascotaId) { response.status(400).json({ error: 'El ID de mascota debe ser un entero positivo.' }); return; }
  try {
    const imagenes = await listarImagenesPublicas(mascotaId);
    if (!imagenes) { response.status(404).json({ error: 'No se encontró una publicación activa con ese ID.' }); return; }
    response.status(200).json(imagenes);
  } catch (error) { next(error); }
}
