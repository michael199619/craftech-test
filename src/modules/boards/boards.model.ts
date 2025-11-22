import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../core/database/database.js';
import { User } from '../users/users.model.js';

export enum HistoryOperation {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export class UsersBoards extends Model {
  declare id: string;
  declare userId: string;
  declare boardId: string;
}

export class Board extends Model {
  declare id: string;
  declare name: string;
  declare authorId?: string;
  declare private: boolean;
}

export class BoardHistory extends Model {
  declare id: string;
  declare authorId: string;
  declare boardId: string;
  declare operation: HistoryOperation;
  declare entityId?: string;
  declare createdAt: Date;
  declare key?: string;
  declare oldValue?: string;
  declare newValue?: string;
}

Board.init(
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

    authorId: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    private: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { sequelize, modelName: 'Board' },
);

Board.belongsTo(User, { as: 'author', foreignKey: 'authorId' });
User.hasMany(Board, { foreignKey: 'authorId' });

UsersBoards.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    boardId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  { sequelize, modelName: 'UsersBoards' },
);

User.belongsToMany(Board, { through: UsersBoards, foreignKey: 'userId' });
Board.belongsToMany(User, { through: UsersBoards, foreignKey: 'boardId' });

BoardHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    authorId: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    boardId: {
      type: DataTypes.UUID,
    },

    operation: {
      type: DataTypes.ENUM(...Object.values(HistoryOperation)),
      allowNull: true,
    },

    entityId: {
      type: DataTypes.UUID,
    },

    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    key: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    oldValue: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    newValue: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  { sequelize, modelName: 'BoardHistory' },
);

BoardHistory.belongsTo(User, { as: 'author', foreignKey: 'authorId' });
BoardHistory.belongsTo(Board, { as: 'board', foreignKey: 'boardId' });
