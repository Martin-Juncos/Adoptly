/** Define una solicitud de adopción enviada por un usuario adoptante. */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Mascota } from './mascota.model';
import { Usuario } from './usuario.model';

export type EstadoSolicitud = 'pendiente' | 'aceptada' | 'rechazada';

interface SolicitudAttributes {
  id: number;
  mascota_id: number;
  adoptante_id: number;
  telefono: string;
  motivacion: string;
  tipo_vivienda: string;
  otros_animales: string | null;
  estado: EstadoSolicitud;
  motivo_rechazo: string | null;
  fecha_resolucion: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

type SolicitudCreationAttributes = Optional<
  SolicitudAttributes,
  'id' | 'otros_animales' | 'estado' | 'motivo_rechazo' | 'fecha_resolucion' | 'createdAt' | 'updatedAt'
>;

export class Solicitud extends Model<SolicitudAttributes, SolicitudCreationAttributes> implements SolicitudAttributes {
  declare id: number;
  declare mascota_id: number;
  declare adoptante_id: number;
  declare telefono: string;
  declare motivacion: string;
  declare tipo_vivienda: string;
  declare otros_animales: string | null;
  declare estado: EstadoSolicitud;
  declare motivo_rechazo: string | null;
  declare fecha_resolucion: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Solicitud.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    mascota_id: { type: DataTypes.INTEGER, allowNull: false },
    adoptante_id: { type: DataTypes.INTEGER, allowNull: false },
    telefono: { type: DataTypes.STRING(30), allowNull: false },
    motivacion: { type: DataTypes.TEXT, allowNull: false },
    tipo_vivienda: { type: DataTypes.STRING(100), allowNull: false },
    otros_animales: { type: DataTypes.TEXT, allowNull: true },
    estado: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'pendiente' },
    motivo_rechazo: { type: DataTypes.TEXT, allowNull: true },
    fecha_resolucion: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'Solicitud',
    indexes: [{ name: 'solicitud_mascota_adoptante_unica', unique: true, fields: ['mascota_id', 'adoptante_id'] }],
  },
);

Solicitud.belongsTo(Mascota, { foreignKey: 'mascota_id', as: 'mascota' });
Solicitud.belongsTo(Usuario, { foreignKey: 'adoptante_id', as: 'adoptante' });
