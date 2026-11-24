/** Valida y responde las solicitudes de adopción enviadas por adoptantes. */

import { NextFunction, Request, Response } from 'express';
import {
  crearSolicitud as crearSolicitudServicio,
  DecisionSolicitud,
  listarSolicitudesDelAdoptante,
  listarSolicitudesDeMascota,
  resolverSolicitud as resolverSolicitudServicio,
} from '../services/solicitud.service';

function leerIdPositivo(idTexto: unknown): number | null {
  if (typeof idTexto !== 'string' || !/^\d+$/.test(idTexto) || Number(idTexto) < 1) return null;
  return Number(idTexto);
}

// Registra una solicitud para una mascota; la identidad se toma del token y no del body.
export async function enviarSolicitud(request: Request, response: Response, next: NextFunction): Promise<void> {
  const mascotaId = leerIdPositivo(request.params.id);
  if (!mascotaId) { response.status(400).json({ error: 'El ID de mascota debe ser un entero positivo.' }); return; }

  const body = request.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    response.status(400).json({ error: 'El cuerpo debe ser un objeto JSON.' }); return;
  }
  if (typeof body.telefono !== 'string' || !body.telefono.trim() || body.telefono.trim().length > 30) {
    response.status(400).json({ error: 'Completá teléfono (hasta 30 caracteres).' }); return;
  }
  if (typeof body.motivacion !== 'string' || !body.motivacion.trim()) {
    response.status(400).json({ error: 'Completá la motivación para adoptar.' }); return;
  }
  if (typeof body.tipo_vivienda !== 'string' || !body.tipo_vivienda.trim() || body.tipo_vivienda.trim().length > 100) {
    response.status(400).json({ error: 'Completá tipo_vivienda (hasta 100 caracteres).' }); return;
  }
  if (body.otros_animales !== undefined && body.otros_animales !== null && typeof body.otros_animales !== 'string') {
    response.status(400).json({ error: 'otros_animales debe ser texto o null.' }); return;
  }

  try {
    const resultado = await crearSolicitudServicio({
      mascota_id: mascotaId,
      adoptante_id: request.usuario!.id,
      telefono: body.telefono.trim(),
      motivacion: body.motivacion.trim(),
      tipo_vivienda: body.tipo_vivienda.trim(),
      otros_animales: typeof body.otros_animales === 'string' ? body.otros_animales.trim() || null : null,
    });

    if (resultado.estado === 'mascota_no_encontrada') { response.status(404).json({ error: 'No se encontró una publicación activa con ese ID.' }); return; }
    if (resultado.estado === 'mascota_adoptada') { response.status(409).json({ error: 'Esta mascota ya fue adoptada.' }); return; }
    if (resultado.estado === 'sin_imagen') { response.status(409).json({ error: 'La publicación necesita al menos una imagen antes de recibir solicitudes.' }); return; }
    if (resultado.estado === 'duplicada') { response.status(409).json({ error: 'Ya enviaste una solicitud para esta mascota.' }); return; }

    response.status(201).json(resultado.solicitud);
  } catch (error) { next(error); }
}

// Devuelve las solicitudes del adoptante autenticado y ninguna otra.
export async function obtenerMisSolicitudes(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const solicitudes = await listarSolicitudesDelAdoptante(request.usuario!.id);
    response.status(200).json(solicitudes);
  } catch (error) { next(error); }
}

// Permite que el publicador dueño consulte las solicitudes de una publicación.
export async function obtenerSolicitudesDeMascota(request: Request, response: Response, next: NextFunction): Promise<void> {
  const mascotaId = leerIdPositivo(request.params.id);
  if (!mascotaId) { response.status(400).json({ error: 'El ID de mascota debe ser un entero positivo.' }); return; }

  try {
    const resultado = await listarSolicitudesDeMascota(mascotaId, request.usuario!.id);
    if (resultado.estado === 'mascota_no_encontrada') {
      response.status(404).json({ error: 'No se encontró una publicación propia con ese ID.' }); return;
    }
    response.status(200).json(resultado.solicitudes);
  } catch (error) { next(error); }
}

// Acepta o rechaza una solicitud que pertenece a una mascota del publicador.
export async function resolverSolicitud(request: Request, response: Response, next: NextFunction): Promise<void> {
  const solicitudId = leerIdPositivo(request.params.id);
  if (!solicitudId) { response.status(400).json({ error: 'El ID de solicitud debe ser un entero positivo.' }); return; }

  const body = request.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)
    || (body.decision !== 'aceptar' && body.decision !== 'rechazar')) {
    response.status(400).json({ error: 'La decisión debe ser aceptar o rechazar.' }); return;
  }
  if (body.motivo_rechazo !== undefined && body.motivo_rechazo !== null
    && (typeof body.motivo_rechazo !== 'string' || body.motivo_rechazo.trim().length > 1000)) {
    response.status(400).json({ error: 'El motivo de rechazo debe ser texto de hasta 1000 caracteres.' }); return;
  }
  if (body.decision === 'rechazar'
    && (typeof body.motivo_rechazo !== 'string' || !body.motivo_rechazo.trim())) {
    response.status(400).json({ error: 'Indicá un motivo para rechazar la solicitud.' }); return;
  }

  try {
    const resultado = await resolverSolicitudServicio(
      solicitudId,
      request.usuario!.id,
      body.decision as DecisionSolicitud,
      typeof body.motivo_rechazo === 'string' ? body.motivo_rechazo.trim() : null,
    );
    if (resultado.estado === 'solicitud_no_encontrada' || resultado.estado === 'publicacion_no_propia') {
      response.status(404).json({ error: 'No se encontró una solicitud propia con ese ID.' }); return;
    }
    if (resultado.estado === 'ya_resuelta') {
      response.status(409).json({ error: 'Esta solicitud ya fue resuelta.' }); return;
    }
    if (resultado.estado === 'mascota_adoptada') {
      response.status(409).json({ error: 'La mascota ya fue adoptada.' }); return;
    }

    response.status(200).json({
      solicitud: resultado.solicitud,
      solicitudes_rechazadas: resultado.solicitudes_rechazadas,
    });
  } catch (error) { next(error); }
}
