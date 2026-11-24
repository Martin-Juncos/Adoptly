/** Define los datos de acceso y el perfil de una persona registrada. */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type RolUsuario = 'administrador' | 'publicador' | 'adoptante';
export type TipoPublicador = 'refugio' | 'rescatista' | 'particular';

interface UsuarioAttributes {
  id: number;
  nombre_completo: string;
  email: string;
  password_hash: string;
  telefono: string | null;
  rol: RolUsuario;
  tipo_publicador: TipoPublicador | null;
  descripcion: string | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type UsuarioCreationAttributes = Optional<UsuarioAttributes, 'id' | 'telefono' | 'tipo_publicador' | 'descripcion' | 'activo' | 'createdAt' | 'updatedAt'>;

export class Usuario extends Model<UsuarioAttributes, UsuarioCreationAttributes> implements UsuarioAttributes {
  declare id: number;
  declare nombre_completo: string;
  declare email: string;
  declare password_hash: string;
  declare telefono: string | null;
  declare rol: RolUsuario;
  declare tipo_publicador: TipoPublicador | null;
  declare descripcion: string | null;
  declare activo: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Usuario.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre_completo: { type: DataTypes.STRING(150), allowNull: false },
    email: { type: DataTypes.STRING(254), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    telefono: { type: DataTypes.STRING(30), allowNull: true },
    rol: { type: DataTypes.STRING(20), allowNull: false },
    tipo_publicador: { type: DataTypes.STRING(20), allowNull: true },
    descripcion: { type: DataTypes.TEXT, allowNull: true },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'Usuario' },
);
