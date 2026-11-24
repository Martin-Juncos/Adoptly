/** Contiene las consultas de lectura del registro de adopciones. */

import { Adopcion } from '../models/adopcion.model';
import { Mascota } from '../models/mascota.model';

// Busca adopciones por el ID obtenido del token e incluye datos básicos de la mascota.
export async function listarAdopcionesDelAdoptante(adoptanteId: number): Promise<Adopcion[]> {
  return Adopcion.findAll({
    where: { adoptante_id: adoptanteId },
    attributes: ['id', 'mascota_id', 'fecha_adopcion'],
    include: [{
      model: Mascota,
      as: 'mascota',
      attributes: ['id', 'nombre', 'especie', 'raza', 'tamanio', 'provincia', 'localidad'],
    }],
    order: [['fecha_adopcion', 'DESC']],
  });
}
