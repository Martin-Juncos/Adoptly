/** Define una URL de imagen asociada a una publicación de mascota. */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Mascota } from './mascota.model';

interface ImagenMascotaAttributes {
  id: number;
  mascota_id: number;
  url_imagen: string;
  createdAt: Date;
  updatedAt: Date;
}

type ImagenMascotaCreationAttributes = Optional<ImagenMascotaAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class ImagenMascota extends Model<ImagenMascotaAttributes, ImagenMascotaCreationAttributes> implements ImagenMascotaAttributes {
  declare id: number;
  declare mascota_id: number;
  declare url_imagen: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

ImagenMascota.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    mascota_id: { type: DataTypes.INTEGER, allowNull: false },
    url_imagen: { type: DataTypes.TEXT, allowNull: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'ImagenMascota' },
);

ImagenMascota.belongsTo(Mascota, { foreignKey: 'mascota_id', as: 'mascota' });
Mascota.hasMany(ImagenMascota, { foreignKey: 'mascota_id', as: 'imagenes' });
