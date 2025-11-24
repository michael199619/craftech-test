import { DataTypes, Model } from 'sequelize';
import sequelize from '../../core/database/database.js';
import { User } from '../users/users.model.js';

export enum Role {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

export class UsersWorkspaces extends Model {
  declare id: string;
  declare userId: string;
  declare workspaceId: string;
  declare role: Role;
}

UsersWorkspaces.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    workspaceId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    role: {
      type: DataTypes.ENUM(...Object.values(Role)),
      allowNull: false,
      defaultValue: Role.VIEWER,
    },
  },
  { sequelize, modelName: 'UsersWorkspaces' },
);

export class Workspace extends Model {
  declare authorId: string;
  declare id: string;
  declare name: string;
  declare createdAt: Date;
}

Workspace.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  { sequelize, modelName: 'Workspace' },
);

Workspace.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
Workspace.belongsToMany(User, {
  through: UsersWorkspaces,
  foreignKey: 'workspaceId',
  as: 'users',
});

Workspace.hasMany(UsersWorkspaces, {
  foreignKey: 'workspaceId',
  as: 'usersWorkspaces',
});
UsersWorkspaces.belongsTo(Workspace, {
  foreignKey: 'workspaceId',
  as: 'workspace',
});

User.hasMany(UsersWorkspaces, { foreignKey: 'userId' });
UsersWorkspaces.belongsTo(User, { foreignKey: 'userId' });
