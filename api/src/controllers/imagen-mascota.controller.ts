/** Valida y responde las solicitudes para imágenes asociadas a mascotas. */

import { NextFunction, Request, Response } from 'express';
import { agregarImagenPropia, editarImagenPropia, eliminarImagenPropia, listarImagenesPublicas } from '../services/imagen-mascota.service';

function leerIdPositivo(idTexto: unknown): number | null {
  if (typeof idTexto !== 'string' || !/^\d+$/.test(idTexto) || Number(idTexto) < 1) return null;
  return Number(idTexto);
}

// Comprueba que la URL sea absoluta, use HTTP(S) y no incluya credenciales.
function validarUrlImagen(valor: unknown): { url: string } | { error: string } {
  if (typeof valor !== 'string' || !valor.trim()) return { error: 'Enviá url_imagen como texto.' };
  const urlImagen = valor.trim();
  if (urlImagen.length > 2048) return { error: 'La URL no puede superar 2048 caracteres.' };

  try {
    const url = new URL(urlImagen);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) {
      return { error: 'La URL debe usar http o https y no contener credenciales.' };
    }
  } catch {
    return { error: 'Ingresá una URL válida de imagen.' };
  }

  return { url: urlImagen };
}

// Guarda una URL de imagen en una publicación del publicador autenticado.
export async function agregarImagen(request: Request, response: Response, next: NextFunction): Promise<void> {
  const mascotaId = leerIdPositivo(request.params.id);
  if (!mascotaId) { response.status(400).json({ error: 'El ID de mascota debe ser un entero positivo.' }); return; }

  const body = request.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    response.status(400).json({ error: 'El cuerpo debe ser un objeto JSON.' }); return;
  }
  const resultadoUrl = validarUrlImagen(body.url_imagen);
  if ('error' in resultadoUrl) { response.status(400).json({ error: resultadoUrl.error }); return; }

  try {
    const imagen = await agregarImagenPropia(mascotaId, request.usuario!.id, resultadoUrl.url);
    if (!imagen) { response.status(404).json({ error: 'No se encontró una publicación activa propia con ese ID.' }); return; }
    response.status(201).json(imagen);
  } catch (error) { next(error); }
}

// Reemplaza la URL de una imagen de la publicación propia del publicador.
export async function editarImagen(request: Request, response: Response, next: NextFunction): Promise<void> {
  const mascotaId = leerIdPositivo(request.params.id);
  const imagenId = leerIdPositivo(request.params.imagenId);
  if (!mascotaId || !imagenId) {
    response.status(400).json({ error: 'Los ID de mascota e imagen deben ser enteros positivos.' }); return;
  }

  const body = request.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    response.status(400).json({ error: 'El cuerpo debe ser un objeto JSON.' }); return;
  }
  const resultadoUrl = validarUrlImagen(body.url_imagen);
  if ('error' in resultadoUrl) { response.status(400).json({ error: resultadoUrl.error }); return; }

  try {
    const imagen = await editarImagenPropia(mascotaId, imagenId, request.usuario!.id, resultadoUrl.url);
    if (!imagen) { response.status(404).json({ error: 'No se encontró una imagen propia con esos ID.' }); return; }
    response.status(200).json(imagen);
  } catch (error) { next(error); }
}

// Elimina una imagen de la publicación propia del publicador.
export async function eliminarImagen(request: Request, response: Response, next: NextFunction): Promise<void> {
  const mascotaId = leerIdPositivo(request.params.id);
  const imagenId = leerIdPositivo(request.params.imagenId);
  if (!mascotaId || !imagenId) {
    response.status(400).json({ error: 'Los ID de mascota e imagen deben ser enteros positivos.' }); return;
  }

  try {
    const eliminada = await eliminarImagenPropia(mascotaId, imagenId, request.usuario!.id);
    if (!eliminada) { response.status(404).json({ error: 'No se encontró una imagen propia con esos ID.' }); return; }
    response.status(200).json({ mensaje: 'La imagen fue eliminada.' });
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
