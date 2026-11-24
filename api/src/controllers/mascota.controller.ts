/**
 * Adapta las consultas HTTP de mascotas a las operaciones del servicio.
 */

import { Request, Response, NextFunction } from 'express';
import { Especie } from '../models/mascota.model';
import { buscarMascotaPorId, crearMascota, desactivarMascotaPropia, editarMascotaPropia, listarMascotas } from '../services/mascota.service';

const ESPECIES_VALIDAS: Especie[] = ['perro', 'gato'];
const TAMANIOS_VALIDOS = ['pequenio', 'mediano', 'grande'] as const;

interface CrearMascotaBody {
  nombre: string;
  especie: Especie;
  raza?: string | null;
  tamanio: (typeof TAMANIOS_VALIDOS)[number];
  fecha_nacimiento?: string | null;
  descripcion: string;
  provincia: string;
  localidad: string;
}

// Aplica los mismos límites VARCHAR del modelo antes de insertar o editar.
function tieneLimitesDeTexto(body: Partial<CrearMascotaBody>): boolean {
  return (body.nombre?.trim().length ?? 0) <= 100
    && (body.raza?.trim().length ?? 0) <= 100
    && (body.provincia?.trim().length ?? 0) <= 100
    && (body.localidad?.trim().length ?? 0) <= 100;
}

// Comprueba una fecha de calendario sin convertirla en una hora dependiente de zona horaria.
function fechaNacimientoValida(valor: unknown): valor is string {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const fechaUtc = new Date(`${valor}T00:00:00.000Z`);
  const hoyUtc = new Date().toISOString().slice(0, 10);
  return !Number.isNaN(fechaUtc.getTime()) && fechaUtc.toISOString().slice(0, 10) === valor && valor <= hoyUtc;
}

// Lee el filtro opcional de especie y devuelve solo mascotas con ese valor.
export async function obtenerMascotas(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const especieQuery = request.query.especie;

  // Acepta solo perro o gato para evitar consultas con filtros no válidos.
  if (especieQuery !== undefined && (typeof especieQuery !== 'string' || !ESPECIES_VALIDAS.includes(especieQuery as Especie))) {
    response.status(400).json({ error: 'El filtro especie debe ser perro o gato.' });
    return;
  }

  try {
    const mascotas = await listarMascotas(especieQuery as Especie | undefined);
    response.status(200).json(mascotas);
  } catch (error) {
    next(error);
  }
}

// Busca una mascota activa por el ID que viene en la dirección de la petición.
export async function obtenerMascotaPorId(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const idTexto = request.params.id;

  // El ID debe ser un entero positivo; rechazamos texto o números con decimales.
  if (typeof idTexto !== 'string' || !/^\d+$/.test(idTexto) || Number(idTexto) < 1) {
    response.status(400).json({ error: 'El ID debe ser un número entero positivo.' });
    return;
  }

  try {
    const mascota = await buscarMascotaPorId(Number(idTexto));

    if (!mascota) {
      response.status(404).json({ error: 'No se encontró una mascota activa con ese ID.' });
      return;
    }

    response.status(200).json(mascota);
  } catch (error) {
    next(error);
  }
}

// Valida los datos básicos recibidos antes de guardarlos en PostgreSQL.
export async function publicarMascota(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const body = request.body as Partial<CrearMascotaBody> | null;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    response.status(400).json({ error: 'El cuerpo debe ser un objeto JSON.' });
    return;
  }

  const camposObligatorios: Array<keyof CrearMascotaBody> = [
    'nombre', 'especie', 'tamanio', 'descripcion', 'provincia', 'localidad',
  ];
  const faltaCampo = camposObligatorios.some((campo) => {
    const valor = body[campo];
    return typeof valor !== 'string' || valor.trim().length === 0;
  });

  if (faltaCampo) {
    response.status(400).json({ error: 'Completá nombre, especie, tamanio, descripcion, provincia y localidad.' });
    return;
  }

  if (!ESPECIES_VALIDAS.includes(body.especie as Especie)) {
    response.status(400).json({ error: 'La especie debe ser perro o gato.' });
    return;
  }

  if (!TAMANIOS_VALIDOS.includes(body.tamanio as (typeof TAMANIOS_VALIDOS)[number])) {
    response.status(400).json({ error: 'El tamanio debe ser pequenio, mediano o grande.' });
    return;
  }

  if (!tieneLimitesDeTexto(body)) {
    response.status(400).json({ error: 'Nombre, raza, provincia y localidad deben respetar sus límites de longitud (100 caracteres).' });
    return;
  }

  if (body.raza !== undefined && body.raza !== null && typeof body.raza !== 'string') {
    response.status(400).json({ error: 'La raza debe ser texto o null.' });
    return;
  }

  if (body.fecha_nacimiento !== undefined && body.fecha_nacimiento !== null) {
    if (!fechaNacimientoValida(body.fecha_nacimiento)) {
      response.status(400).json({ error: 'La fecha_nacimiento debe ser una fecha válida no futura (AAAA-MM-DD).'});
      return;
    }
  }

  try {
    const mascota = await crearMascota({
      publicador_id: request.usuario!.id,
      nombre: (body.nombre as string).trim(),
      especie: body.especie as Especie,
      raza: body.raza?.trim() || null,
      tamanio: body.tamanio as CrearMascotaBody['tamanio'],
      fecha_nacimiento: body.fecha_nacimiento ?? null,
      descripcion: (body.descripcion as string).trim(),
      provincia: (body.provincia as string).trim(),
      localidad: (body.localidad as string).trim(),
    });

    response.status(201).json(mascota);
  } catch (error) {
    next(error);
  }
}

// Edita una publicación activa solo si pertenece al publicador autenticado.
export async function editarMascota(request: Request, response: Response, next: NextFunction): Promise<void> {
  const idTexto = request.params.id;
  if (typeof idTexto !== 'string' || !/^\d+$/.test(idTexto) || Number(idTexto) < 1) {
    response.status(400).json({ error: 'El ID debe ser un número entero positivo.' }); return;
  }

  const body = request.body as Partial<CrearMascotaBody> | null;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    response.status(400).json({ error: 'El cuerpo debe ser un objeto JSON.' }); return;
  }
  const required: Array<keyof CrearMascotaBody> = ['nombre', 'especie', 'tamanio', 'descripcion', 'provincia', 'localidad'];
  if (required.some((field) => typeof body[field] !== 'string' || !(body[field] as string).trim())) {
    response.status(400).json({ error: 'Completá nombre, especie, tamanio, descripcion, provincia y localidad.' }); return;
  }
  if (!ESPECIES_VALIDAS.includes(body.especie as Especie) || !TAMANIOS_VALIDOS.includes(body.tamanio as CrearMascotaBody['tamanio'])) {
    response.status(400).json({ error: 'Revisá especie (perro/gato) y tamanio (pequenio/mediano/grande).' }); return;
  }
  if (!tieneLimitesDeTexto(body)) {
    response.status(400).json({ error: 'Nombre, raza, provincia y localidad deben respetar sus límites de longitud (100 caracteres).' }); return;
  }
  if (body.raza !== undefined && body.raza !== null && typeof body.raza !== 'string') {
    response.status(400).json({ error: 'La raza debe ser texto o null.' }); return;
  }
  if (body.fecha_nacimiento !== undefined && body.fecha_nacimiento !== null) {
    if (!fechaNacimientoValida(body.fecha_nacimiento)) {
      response.status(400).json({ error: 'La fecha_nacimiento debe ser una fecha válida no futura (AAAA-MM-DD).' }); return;
    }
  }

  try {
    const mascota = await editarMascotaPropia(Number(idTexto), request.usuario!.id, {
      nombre: body.nombre!.trim(), especie: body.especie as Especie, raza: body.raza?.trim() || null,
      tamanio: body.tamanio as CrearMascotaBody['tamanio'],
      fecha_nacimiento: body.fecha_nacimiento ?? null,
      descripcion: body.descripcion!.trim(), provincia: body.provincia!.trim(), localidad: body.localidad!.trim(),
    });
    if (!mascota) { response.status(404).json({ error: 'No se encontró una publicación activa propia con ese ID.' }); return; }
    response.status(200).json(mascota);
  } catch (error) { next(error); }
}

// Desactiva la publicación propia sin borrar sus datos.
export async function desactivarMascota(request: Request, response: Response, next: NextFunction): Promise<void> {
  const idTexto = request.params.id;
  if (typeof idTexto !== 'string' || !/^\d+$/.test(idTexto) || Number(idTexto) < 1) {
    response.status(400).json({ error: 'El ID debe ser un número entero positivo.' }); return;
  }
  try {
    const mascota = await desactivarMascotaPropia(Number(idTexto), request.usuario!.id);
    if (!mascota) { response.status(404).json({ error: 'No se encontró una publicación activa propia con ese ID.' }); return; }
    response.status(200).json({ mensaje: 'La publicación fue desactivada.', mascota });
  } catch (error) { next(error); }
}
