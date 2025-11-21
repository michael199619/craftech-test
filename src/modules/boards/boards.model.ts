import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../core/database.js';
import { User } from '../users/users.model.js';

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
