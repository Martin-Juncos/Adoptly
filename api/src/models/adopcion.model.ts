/** Define el registro de una adopción confirmada. */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Mascota } from './mascota.model';
import { Solicitud } from './solicitud.model';
import { Usuario } from './usuario.model';

interface AdopcionAttributes {
  id: number;
  solicitud_id: number;
  mascota_id: number;
  adoptante_id: number;
  fecha_adopcion: Date;
  createdAt: Date;
  updatedAt: Date;
}

type AdopcionCreationAttributes = Optional<AdopcionAttributes, 'id' | 'fecha_adopcion' | 'createdAt' | 'updatedAt'>;

export class Adopcion extends Model<AdopcionAttributes, AdopcionCreationAttributes> implements AdopcionAttributes {
  declare id: number;
  declare solicitud_id: number;
  declare mascota_id: number;
  declare adoptante_id: number;
  declare fecha_adopcion: Date;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Adopcion.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    solicitud_id: { type: DataTypes.INTEGER, allowNull: false, unique: 'adopcion_solicitud_unica' },
    mascota_id: { type: DataTypes.INTEGER, allowNull: false, unique: 'adopcion_mascota_unica' },
    adoptante_id: { type: DataTypes.INTEGER, allowNull: false },
    fecha_adopcion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'Adopcion' },
);

Adopcion.belongsTo(Solicitud, { foreignKey: 'solicitud_id', as: 'solicitud' });
Adopcion.belongsTo(Mascota, { foreignKey: 'mascota_id', as: 'mascota' });
Adopcion.belongsTo(Usuario, { foreignKey: 'adoptante_id', as: 'adoptante' });
Solicitud.hasOne(Adopcion, { foreignKey: 'solicitud_id', as: 'adopcion' });
Mascota.hasOne(Adopcion, { foreignKey: 'mascota_id', as: 'adopcion' });
Usuario.hasMany(Adopcion, { foreignKey: 'adoptante_id', as: 'adopciones' });
