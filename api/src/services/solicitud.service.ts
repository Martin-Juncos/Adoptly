/** Contiene las reglas para crear, consultar y resolver solicitudes de adopción. */

import { Op, UniqueConstraintError } from 'sequelize';
import { sequelize } from '../config/database';
import { ImagenMascota } from '../models/imagen-mascota.model';
import { Mascota } from '../models/mascota.model';
import { Usuario } from '../models/usuario.model';
import { Solicitud } from '../models/solicitud.model';
import { Adopcion } from '../models/adopcion.model';

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

// Lista únicamente las solicitudes enviadas por el adoptante autenticado.
export async function listarSolicitudesDelAdoptante(adoptanteId: number): Promise<Solicitud[]> {
  return Solicitud.findAll({
    where: { adoptante_id: adoptanteId },
    include: [{
      model: Mascota,
      as: 'mascota',
      attributes: ['id', 'nombre', 'especie', 'raza', 'provincia', 'localidad', 'estado_adopcion', 'activa'],
    }],
    order: [['createdAt', 'DESC']],
  });
}

export type ResultadoListaPublicador =
  | { estado: 'mascota_no_encontrada' }
  | { estado: 'encontrada'; solicitudes: Solicitud[] };

// Comprueba que la mascota pertenezca al publicador y devuelve sus solicitudes.
export async function listarSolicitudesDeMascota(mascotaId: number, publicadorId: number): Promise<ResultadoListaPublicador> {
  const mascota = await Mascota.findOne({ where: { id: mascotaId, publicador_id: publicadorId } });
  if (!mascota) return { estado: 'mascota_no_encontrada' };

  const solicitudes = await Solicitud.findAll({
    where: { mascota_id: mascotaId },
    include: [{ model: Usuario, as: 'adoptante', attributes: ['id', 'nombre_completo'] }],
    order: [['createdAt', 'ASC']],
  });
  return { estado: 'encontrada', solicitudes };
}

export type DecisionSolicitud = 'aceptar' | 'rechazar';
export type ResultadoResolucion =
  | { estado: 'solicitud_no_encontrada' }
  | { estado: 'publicacion_no_propia' }
  | { estado: 'ya_resuelta' }
  | { estado: 'mascota_adoptada' }
  | { estado: 'resuelta'; solicitud: Solicitud; adopcion: Adopcion | null; solicitudes_rechazadas: number };

// Resuelve una solicitud y actualiza todas las pendientes de esa mascota en una transacción.
export async function resolverSolicitud(
  solicitudId: number,
  publicadorId: number,
  decision: DecisionSolicitud,
  motivoRechazo: string | null,
): Promise<ResultadoResolucion> {
  try {
    return await sequelize.transaction(async (transaction) => {
      const solicitudInicial = await Solicitud.findByPk(solicitudId, { transaction });
      if (!solicitudInicial) return { estado: 'solicitud_no_encontrada' };

      // Serializa las decisiones para que no se acepten dos solicitudes de la misma mascota.
      const mascota = await Mascota.findOne({
        where: { id: solicitudInicial.mascota_id, publicador_id: publicadorId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!mascota) return { estado: 'publicacion_no_propia' };

      const solicitud = await Solicitud.findOne({
        where: { id: solicitudId, mascota_id: mascota.id },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!solicitud) return { estado: 'solicitud_no_encontrada' };
      if (solicitud.estado !== 'pendiente') return { estado: 'ya_resuelta' };
      if (mascota.estado_adopcion === 'adoptada') return { estado: 'mascota_adoptada' };
      if (await Adopcion.findOne({ where: { mascota_id: mascota.id }, transaction })) {
        return { estado: 'mascota_adoptada' };
      }

      const fechaResolucion = new Date();
      await solicitud.update({
        estado: decision === 'aceptar' ? 'aceptada' : 'rechazada',
        motivo_rechazo: decision === 'rechazar' ? motivoRechazo : null,
        fecha_resolucion: fechaResolucion,
      }, { transaction });

      let solicitudesRechazadas = 0;
      let adopcion: Adopcion | null = null;
      if (decision === 'aceptar') {
        const [cantidad] = await Solicitud.update({
          estado: 'rechazada',
          motivo_rechazo: 'La mascota fue adoptada por otro solicitante.',
          fecha_resolucion: fechaResolucion,
        }, {
          where: { mascota_id: mascota.id, estado: 'pendiente', id: { [Op.ne]: solicitud.id } },
          transaction,
        });
        solicitudesRechazadas = cantidad;
        await mascota.update({ estado_adopcion: 'adoptada' }, { transaction });
        adopcion = await Adopcion.create({
          solicitud_id: solicitud.id,
          mascota_id: mascota.id,
          adoptante_id: solicitud.adoptante_id,
        }, { transaction });
      } else {
        const solicitudesPendientes = await Solicitud.count({
          where: { mascota_id: mascota.id, estado: 'pendiente' },
          transaction,
        });
        if (solicitudesPendientes === 0) {
          await mascota.update({ estado_adopcion: 'disponible' }, { transaction });
        }
      }

      return { estado: 'resuelta', solicitud, adopcion, solicitudes_rechazadas: solicitudesRechazadas };
    });
  } catch (error) {
    // Las restricciones únicas son una última defensa contra adopciones duplicadas.
    if (error instanceof UniqueConstraintError) return { estado: 'mascota_adoptada' };
    throw error;
  }
}
