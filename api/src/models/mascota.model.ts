/**
 * Define la forma de una mascota guardada en PostgreSQL.
 * Este modelo solo describe la tabla; no la crea automáticamente.
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Usuario } from './usuario.model';

export type Especie = 'perro' | 'gato';
export type Tamanio = 'pequenio' | 'mediano' | 'grande';
export type EstadoAdopcion = 'disponible' | 'con_solicitudes_pendientes' | 'adoptada';

interface MascotaAttributes {
  id: number;
  publicador_id: number;
  nombre: string;
  especie: Especie;
  raza: string | null;
  tamanio: Tamanio;
  fecha_nacimiento: Date | null;
  descripcion: string;
  provincia: string;
  localidad: string;
  estado_adopcion: EstadoAdopcion;
  activa: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type MascotaCreationAttributes = Optional<
  MascotaAttributes,
  'id' | 'raza' | 'fecha_nacimiento' | 'estado_adopcion' | 'activa' | 'createdAt' | 'updatedAt'
>;

export class Mascota extends Model<MascotaAttributes, MascotaCreationAttributes> implements MascotaAttributes {
  declare id: number;
  declare publicador_id: number;
  declare nombre: string;
  declare especie: Especie;
  declare raza: string | null;
  declare tamanio: Tamanio;
  declare fecha_nacimiento: Date | null;
  declare descripcion: string;
  declare provincia: string;
  declare localidad: string;
  declare estado_adopcion: EstadoAdopcion;
  declare activa: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Mascota.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    publicador_id: { type: DataTypes.INTEGER, allowNull: false },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    especie: { type: DataTypes.STRING(20), allowNull: false },
    raza: { type: DataTypes.STRING(100), allowNull: true },
    tamanio: { type: DataTypes.STRING(20), allowNull: false },
    fecha_nacimiento: { type: DataTypes.DATEONLY, allowNull: true },
    descripcion: { type: DataTypes.TEXT, allowNull: false },
    provincia: { type: DataTypes.STRING(100), allowNull: false },
    localidad: { type: DataTypes.STRING(100), allowNull: false },
    estado_adopcion: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'disponible' },
    activa: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'Mascota' },
);

Mascota.belongsTo(Usuario, { foreignKey: 'publicador_id', as: 'publicador' });
