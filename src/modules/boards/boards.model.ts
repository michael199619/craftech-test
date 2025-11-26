import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../core/database/database.js';
import { User } from '../users/users.model.js';
import { Role, Workspace } from '../workspaces/workspaces.model.js';

export enum HistoryOperation {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum HistoryEntity {
  BOARD = 'BOARD',
  STICKER = 'STICKER',
  STICKER_META = 'STICKER_META',
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
  declare workspaceId?: string;
  declare private: boolean;
}

export class BoardHistory extends Model {
  declare id: string;
  declare authorId: string;
  declare boardId: string;
  declare operation: HistoryOperation;
  declare entityId?: string;
  declare entityName: HistoryEntity;
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

    workspaceId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Board',
    tableName: 'Board',
    createdAt: false,
    updatedAt: false,
  },
);

Board.belongsTo(User, { as: 'author', foreignKey: 'authorId' });
User.hasMany(Board, { foreignKey: 'authorId' });

Board.belongsTo(Workspace, { foreignKey: 'workspaceId', as: 'workspace' });
Workspace.hasMany(Board, { foreignKey: 'workspaceId', as: 'boards' });

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

    role: {
      type: DataTypes.ENUM(...Object.values(Role)),
      allowNull: false,
      defaultValue: Role.VIEWER,
    },
  },
  { sequelize, modelName: 'UsersBoards' },
);

User.belongsToMany(Board, {
  through: UsersBoards,
  foreignKey: 'userId',
  as: 'boards',
});

Board.belongsToMany(User, {
  through: UsersBoards,
  foreignKey: 'boardId',
  as: 'users',
});

User.hasMany(UsersBoards, { foreignKey: 'userId' });
UsersBoards.belongsTo(User, { foreignKey: 'userId' });

Board.hasMany(UsersBoards, { foreignKey: 'boardId' });
UsersBoards.belongsTo(Board, { foreignKey: 'boardId' });

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

    entityName: {
      type: DataTypes.ENUM(...Object.values(HistoryEntity)),
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
  {
    sequelize,
    modelName: 'BoardHistory',
    tableName: 'BoardHistory',
    updatedAt: false,
  },
);

BoardHistory.belongsTo(User, { as: 'author', foreignKey: 'authorId' });
BoardHistory.belongsTo(Board, {
  as: 'board',
  foreignKey: 'boardId',
  onDelete: 'SET NULL',
});
