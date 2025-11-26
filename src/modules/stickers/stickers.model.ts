import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../core/database/database.js';
import { Board } from '../boards/boards.model.js';

export class Sticker extends Model {
  declare id: string;
  declare name: string;
  declare description: string;
  declare createdAt: Date;
  declare boardId: string;
  declare stickerMetaId: string;
}

export class StickerMeta extends Model {
  declare id: string;
  declare positionX: number;
  declare width: number;
  declare height: number;
  declare positionY: number;
  declare index: number;
}

StickerMeta.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    positionX: {
      type: DataTypes.FLOAT,
    },

    positionY: {
      type: DataTypes.FLOAT,
    },

    width: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    height: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    index: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'StickerMeta',
    tableName: 'StickerMeta',
    createdAt: false,
    updatedAt: false,
  },
);

Sticker.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    boardId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    stickerMetaId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Sticker',
    tableName: 'Sticker',
    createdAt: false,
    updatedAt: false,
  },
);

Sticker.belongsTo(Board, { foreignKey: 'boardId' });
Board.hasMany(Sticker, { foreignKey: 'boardId', as: 'stickers' });

Sticker.belongsTo(StickerMeta, { foreignKey: 'stickerMetaId', as: 'meta' });
StickerMeta.hasOne(Sticker, { foreignKey: 'stickerMetaId' });
