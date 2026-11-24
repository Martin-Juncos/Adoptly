/** Contiene las reglas necesarias para crear una solicitud de adopción. */

import { UniqueConstraintError } from 'sequelize';
import { sequelize } from '../config/database';
import { ImagenMascota } from '../models/imagen-mascota.model';
import { Mascota } from '../models/mascota.model';
import { Usuario } from '../models/usuario.model';
import { Solicitud } from '../models/solicitud.model';

export interface DatosNuevaSolicitud {
  mascota_id: number;
  adoptante_id: number;
  telefono: string;
  motivacion: string;
  tipo_vivienda: string;
  otros_animales: string | null;
}

export type ResultadoSolicitud =
  | { estado: 'mascota_no_encontrada' }
  | { estado: 'mascota_adoptada' }
  | { estado: 'sin_imagen' }
  | { estado: 'duplicada' }
  | { estado: 'creada'; solicitud: Solicitud };

// Crea una única solicitud si la mascota está disponible y tiene una imagen.
export async function crearSolicitud(datos: DatosNuevaSolicitud): Promise<ResultadoSolicitud> {
  try {
    return await sequelize.transaction(async (transaction) => {
      // Bloquea la publicación mientras valida y guarda para mantener el estado consistente.
      const mascota = await Mascota.findOne({
        where: { id: datos.mascota_id, activa: true },
        include: [{ model: Usuario, as: 'publicador', attributes: [], where: { activo: true, rol: 'publicador' } }],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!mascota) return { estado: 'mascota_no_encontrada' };
      if (mascota.estado_adopcion === 'adoptada') return { estado: 'mascota_adoptada' };

      const imagen = await ImagenMascota.findOne({ where: { mascota_id: mascota.id }, transaction });
      if (!imagen) return { estado: 'sin_imagen' };

      const existente = await Solicitud.findOne({ where: { mascota_id: mascota.id, adoptante_id: datos.adoptante_id }, transaction });
      if (existente) return { estado: 'duplicada' };

      const solicitud = await Solicitud.create(datos, { transaction });
      await mascota.update({ estado_adopcion: 'con_solicitudes_pendientes' }, { transaction });
      return { estado: 'creada', solicitud };
    });
  } catch (error) {
    // El índice único protege también contra solicitudes simultáneas duplicadas.
    if (error instanceof UniqueConstraintError) return { estado: 'duplicada' };
    throw error;
  }
}
