/** Contiene las consultas para agregar y consultar URLs de imágenes de mascotas. */

import { ImagenMascota } from '../models/imagen-mascota.model';
import { buscarMascotaPorId, buscarMascotaPropia } from './mascota.service';

// Agrega una imagen solo si la publicación está activa y pertenece al publicador.
export async function agregarImagenPropia(mascotaId: number, publicadorId: number, urlImagen: string): Promise<ImagenMascota | null> {
  const mascota = await buscarMascotaPropia(mascotaId, publicadorId);
  if (!mascota) return null;
  return ImagenMascota.create({ mascota_id: mascota.id, url_imagen: urlImagen });
}

// Lista imágenes de una publicación que el público puede consultar.
export async function listarImagenesPublicas(mascotaId: number): Promise<ImagenMascota[] | null> {
  const mascota = await buscarMascotaPorId(mascotaId);
  if (!mascota) return null;
  return ImagenMascota.findAll({ where: { mascota_id: mascotaId }, order: [['id', 'ASC']] });
}
