'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('User', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
      name: { type: DataTypes.STRING(255) },
      password: { type: DataTypes.STRING(255), comment: 'hash' },
      login: { type: DataTypes.STRING(255) },
      status: {
        type: DataTypes.ENUM('AUTHORIZED', 'ANONYMOUS'),
        allowNull: false,
        defaultValue: 'ANONYMOUS',
      },
      registrationCode: {
        type: DataTypes.STRING(255),
        comment: 'код нужен для привязки анонима',
      },
      loginedAt: { type: DataTypes.DATE, allowNull: false },
    });

    await queryInterface.createTable('Board', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
      name: { type: DataTypes.STRING(255), allowNull: false },
      authorId: { type: DataTypes.UUID, comment: 'автора может не быть' },
      private: { type: DataTypes.BOOLEAN, defaultValue: false },
    });

    await queryInterface.createTable('StickerMeta', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
      positionX: { type: DataTypes.FLOAT },
      positionY: { type: DataTypes.FLOAT },
      index: { type: DataTypes.INTEGER, allowNull: false },
      width: { type: DataTypes.FLOAT, allowNull: false },
      height: { type: DataTypes.FLOAT, allowNull: false },
    });

    await queryInterface.createTable('Sticker', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
      name: { type: DataTypes.STRING(255), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      boardId: { type: DataTypes.UUID, allowNull: false },
      stickerMetaId: { type: DataTypes.UUID, allowNull: false },
    });

    await queryInterface.createTable('UsersBoards', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
      userId: { type: DataTypes.UUID, allowNull: false },
      boardId: { type: DataTypes.UUID, allowNull: false },
    });

    await queryInterface.createTable('BoardHistory', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
      boardId: { type: DataTypes.UUID, allowNull: false },
      operation: {
        type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE'),
        allowNull: false,
      },
      entityId: { type: DataTypes.UUID, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      oldValue: { type: DataTypes.TEXT },
      newValue: { type: DataTypes.TEXT },
      key: { type: DataTypes.STRING(255) },
      authorId: { type: DataTypes.UUID },
    });

    await queryInterface.addConstraint('Board', {
      fields: ['authorId'],
      type: 'foreign key',
      references: { table: 'User', field: 'id' },
      onUpdate: 'NO ACTION',
      onDelete: 'NO ACTION',
      name: 'fk_Board_authorId_User',
    });

    await queryInterface.addConstraint('Sticker', {
      fields: ['boardId'],
      type: 'foreign key',
      references: { table: 'Board', field: 'id' },
      onUpdate: 'NO ACTION',
      onDelete: 'NO ACTION',
      name: 'fk_Sticker_boardId_Board',
    });

    await queryInterface.addConstraint('Sticker', {
      fields: ['stickerMetaId'],
      type: 'foreign key',
      references: { table: 'StickerMeta', field: 'id' },
      onUpdate: 'NO ACTION',
      onDelete: 'NO ACTION',
      name: 'fk_Sticker_stickerMetaId_StickerMeta',
    });

    await queryInterface.addConstraint('UsersBoards', {
      fields: ['userId'],
      type: 'foreign key',
      references: { table: 'User', field: 'id' },
      name: 'fk_UsersBoards_userId_User',
    });

    await queryInterface.addConstraint('UsersBoards', {
      fields: ['boardId'],
      type: 'foreign key',
      references: { table: 'Board', field: 'id' },
      name: 'fk_UsersBoards_boardId_Board',
    });

    await queryInterface.addConstraint('BoardHistory', {
      fields: ['boardId'],
      type: 'foreign key',
      references: { table: 'Board', field: 'id' },
      name: 'fk_BoardHistory_boardId_Board',
    });

    await queryInterface.addConstraint('BoardHistory', {
      fields: ['authorId'],
      type: 'foreign key',
      references: { table: 'User', field: 'id' },
      name: 'fk_BoardHistory_authorId_User',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('BoardHistory');
    await queryInterface.dropTable('UsersBoards');
    await queryInterface.dropTable('Sticker');
    await queryInterface.dropTable('StickerMeta');
    await queryInterface.dropTable('Board');
    await queryInterface.dropTable('User');
  },
};
