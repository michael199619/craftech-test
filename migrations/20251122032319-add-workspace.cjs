'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('Workspace', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
      name: { type: DataTypes.STRING(255), allowNull: false },
      authorId: { type: DataTypes.UUID, allowNull: false },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date(),
      },
    });

    await queryInterface.addConstraint('Workspace', {
      fields: ['authorId'],
      type: 'foreign key',
      references: { table: 'User', field: 'id' },
      name: 'fk_Workspace_authorId_User',
    });

    await queryInterface.createTable('UsersWorkspaces', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
      userId: { type: DataTypes.UUID, allowNull: false },
      workspaceId: { type: DataTypes.UUID, allowNull: false },
      role: {
        type: DataTypes.ENUM('ADMIN', 'EDITOR', 'VIEWER'),
        allowNull: false,
        defaultValue: 'ADMIN',
        comment: `VIEWER - смотрит, но не видит приватную доску
EDITOR - может изменять, но не видит приватную доску
ADMIN - владелец`,
      },
    });

    await queryInterface.addConstraint('UsersWorkspaces', {
      fields: ['userId'],
      type: 'foreign key',
      references: { table: 'User', field: 'id' },
      name: 'fk_UsersWorkspaces_userId_User',
    });

    await queryInterface.addConstraint('UsersWorkspaces', {
      fields: ['workspaceId'],
      type: 'foreign key',
      references: { table: 'Workspace', field: 'id' },
      name: 'fk_UsersWorkspaces_workspaceId_Workspace',
    });

    await queryInterface.addColumn('Board', 'workspaceId', {
      type: DataTypes.UUID,
      allowNull: true,
    });

    await queryInterface.addConstraint('Board', {
      fields: ['workspaceId'],
      type: 'foreign key',
      references: { table: 'Workspace', field: 'id' },
      name: 'fk_Board_workspaceId_Workspace',
    });

    await queryInterface.addColumn('UsersBoards', 'role', {
      type: DataTypes.ENUM('ADMIN', 'EDITOR', 'VIEWER'),
      allowNull: false,
      defaultValue: 'VIEWER',
      comment:
        'VIEWER - смотрит, EDITOR - может редактировать, ADMIN - владелец',
    });
  },

  async down(queryInterface) {
    const boardTable = await queryInterface.describeTable('Board');

    if (boardTable.workspaceId) {
      await queryInterface.removeConstraint(
        'Board',
        'fk_Board_workspaceId_Workspace',
      );
      await queryInterface.removeColumn('Board', 'workspaceId');
    }

    const usersBoardsTable = await queryInterface.describeTable('UsersBoards');
    if (usersBoardsTable.role) {
      await queryInterface.removeColumn('UsersBoards', 'role');
    }

    await queryInterface.removeConstraint(
      'UsersWorkspaces',
      'fk_UsersWorkspaces_userId_User',
    );
    await queryInterface.removeConstraint(
      'UsersWorkspaces',
      'fk_UsersWorkspaces_workspaceId_Workspace',
    );
    await queryInterface.dropTable('UsersWorkspaces');

    await queryInterface.removeConstraint(
      'Workspace',
      'fk_Workspace_authorId_User',
    );
    await queryInterface.dropTable('Workspace');
  },
};
