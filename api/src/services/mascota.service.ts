/**
 * Contiene las consultas de lectura para mascotas.
 * Por ahora permite listar publicaciones públicas activas.
 */

import { Mascota } from '../models/mascota.model';

// Obtiene solo mascotas con publicación activa y sin exponer datos de Sequelize.
export async function listarMascotas(): Promise<Mascota[]> {
  return Mascota.findAll({
    where: { activa: true },
    order: [['id', 'ASC']],
  });
}
