import { sequelize } from '../mysql.js';
import sequelizePkg from 'sequelize';

const { DataTypes, Model } = sequelizePkg;

export class EoloPlant extends Model { }

EoloPlant.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  planning: DataTypes.STRING,
  progress: {
    type: DataTypes.STRING,
    defaultValue: '0%'
  }
}, {
  sequelize,
  modelName: 'EoloPlant',
  tableName: 'EoloPlants',
  timestamps: false
});
