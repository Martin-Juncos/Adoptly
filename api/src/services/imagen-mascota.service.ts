/** Contiene las consultas para agregar y consultar URLs de imágenes de mascotas. */

import { ImagenMascota } from '../models/imagen-mascota.model';
import { buscarMascotaPorId, buscarMascotaPropia } from './mascota.service';

// Agrega una imagen solo si la publicación está activa y pertenece al publicador.
export async function agregarImagenPropia(mascotaId: number, publicadorId: number, urlImagen: string): Promise<ImagenMascota | null> {
  const mascota = await buscarMascotaPropia(mascotaId, publicadorId);
  if (!mascota) return null;
  return ImagenMascota.create({ mascota_id: mascota.id, url_imagen: urlImagen });
}

// Reemplaza la URL si la imagen pertenece a una publicación activa del publicador.
export async function editarImagenPropia(
  mascotaId: number,
  imagenId: number,
  publicadorId: number,
  urlImagen: string,
): Promise<ImagenMascota | null> {
  const mascota = await buscarMascotaPropia(mascotaId, publicadorId);
  if (!mascota) return null;

  const imagen = await ImagenMascota.findOne({ where: { id: imagenId, mascota_id: mascota.id } });
  if (!imagen) return null;

  await imagen.update({ url_imagen: urlImagen });
  return imagen;
}

// Elimina una imagen si pertenece a una publicación activa del publicador.
export async function eliminarImagenPropia(
  mascotaId: number,
  imagenId: number,
  publicadorId: number,
): Promise<boolean> {
  const mascota = await buscarMascotaPropia(mascotaId, publicadorId);
  if (!mascota) return false;

  const imagen = await ImagenMascota.findOne({ where: { id: imagenId, mascota_id: mascota.id } });
  if (!imagen) return false;

  await imagen.destroy();
  return true;
}

// Lista imágenes de una publicación que el público puede consultar.
export async function listarImagenesPublicas(mascotaId: number): Promise<ImagenMascota[] | null> {
  const mascota = await buscarMascotaPorId(mascotaId);
  if (!mascota) return null;
  return ImagenMascota.findAll({ where: { mascota_id: mascotaId }, order: [['id', 'ASC']] });
}
