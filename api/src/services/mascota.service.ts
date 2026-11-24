/**
 * Contiene las consultas de lectura para mascotas.
 * Por ahora permite listar publicaciones públicas activas.
 */

import { Especie, Mascota, Tamanio } from '../models/mascota.model';
import { Usuario } from '../models/usuario.model';

interface NuevaMascota {
  publicador_id: number;
  nombre: string;
  especie: Especie;
  raza: string | null;
  tamanio: Tamanio;
  fecha_nacimiento: string | null;
  descripcion: string;
  provincia: string;
  localidad: string;
}

// Busca publicaciones activas y, si se indicó, limita los resultados por especie.
export async function listarMascotas(especie?: Especie): Promise<Mascota[]> {
  return Mascota.findAll({
    where: especie ? { activa: true, especie } : { activa: true },
    include: [{ model: Usuario, as: 'publicador', attributes: [], where: { activo: true, rol: 'publicador' } }],
    order: [['id', 'ASC']],
  });
}

// Busca una publicación activa por su identificador; null significa que no existe.
export async function buscarMascotaPorId(id: number): Promise<Mascota | null> {
  return Mascota.findOne({
    where: { id, activa: true },
    include: [{ model: Usuario, as: 'publicador', attributes: [], where: { activo: true, rol: 'publicador' } }],
  });
}

// Guarda una mascota; Sequelize completa id, estado y fechas automáticamente.
export async function crearMascota(datos: NuevaMascota): Promise<Mascota> {
  return Mascota.create(datos);
}

// Busca mascota por ID y publicador para que cada publicador gestione solo las suyas.
export async function buscarMascotaPropia(id: number, publicadorId: number): Promise<Mascota | null> {
  return Mascota.findOne({ where: { id, publicador_id: publicadorId, activa: true } });
}

// Guarda cambios en una mascota perteneciente al usuario autenticado.
export async function editarMascotaPropia(id: number, publicadorId: number, datos: Omit<NuevaMascota, 'publicador_id'>): Promise<Mascota | null> {
  const mascota = await buscarMascotaPropia(id, publicadorId);
  if (!mascota) return null;
  await mascota.update(datos);
  return mascota;
}

// Desactiva la publicación sin borrar el registro de la base.
export async function desactivarMascotaPropia(id: number, publicadorId: number): Promise<Mascota | null> {
  const mascota = await buscarMascotaPropia(id, publicadorId);
  if (!mascota) return null;
  await mascota.update({ activa: false });
  return mascota;
}
