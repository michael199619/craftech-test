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
      positionX: {
        type: DataTypes.FLOAT,
        comment: 'Это нужно для отображения стикера, фронт сам задаем позицию'
      },
      positionY: {
        type: DataTypes.FLOAT,
        comment: 'Это нужно для отображения стикера, фронт сам задаем позицию'
      },
      index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'номер слоя, чтоб стикер можно было бы переместить над другим стикером или под него'
      },
      width: {
        type: DataTypes.FLOAT,
        allowNull: false,
        comment: 'Это нужно для отображения стикера, фронт сам задаем размер'
      },
      height: {
        type: DataTypes.FLOAT,
        allowNull: false,
        comment: 'Это нужно для отображения стикера, фронт сам задаем размер'
      },
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

    // --- Foreign keys ---
    await queryInterface.addConstraint('Board', {
      fields: ['authorId'],
      type: 'foreign key',
      references: { table: 'User', field: 'id' },
      name: 'fk_board_authorId_user',
      onUpdate: 'NO ACTION',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('Sticker', {
      fields: ['boardId'],
      type: 'foreign key',
      references: { table: 'Board', field: 'id' },
      name: 'fk_sticker_boardId_board',
    });

    await queryInterface.addConstraint('Sticker', {
      fields: ['stickerMetaId'],
      type: 'foreign key',
      references: { table: 'StickerMeta', field: 'id' },
      name: 'fk_sticker_stickerMetaId_stickerMeta',
    });

    await queryInterface.addConstraint('UsersBoards', {
      fields: ['userId'],
      type: 'foreign key',
      references: { table: 'User', field: 'id' },
      name: 'fk_usersBoards_userId_user',
    });

    await queryInterface.addConstraint('UsersBoards', {
      fields: ['boardId'],
      type: 'foreign key',
      references: { table: 'Board', field: 'id' },
      name: 'fk_usersBoards_boardId_board',
    });

    await queryInterface.addConstraint('BoardHistory', {
      fields: ['boardId'],
      type: 'foreign key',
      references: { table: 'Board', field: 'id' },
      name: 'fk_boardHistory_boardId_board',
    });

    await queryInterface.addConstraint('BoardHistory', {
      fields: ['authorId'],
      type: 'foreign key',
      references: { table: 'User', field: 'id' },
      name: 'fk_boardHistory_authorId_user',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint(
      'BoardHistory',
      'fk_boardHistory_authorId_user',
    );
    await queryInterface.removeConstraint(
      'BoardHistory',
      'fk_boardHistory_boardId_board',
    );

    await queryInterface.removeConstraint(
      'UsersBoards',
      'fk_usersBoards_boardId_board',
    );
    await queryInterface.removeConstraint(
      'UsersBoards',
      'fk_usersBoards_userId_user',
    );

    await queryInterface.removeConstraint(
      'Sticker',
      'fk_sticker_stickerMetaId_stickerMeta',
    );
    await queryInterface.removeConstraint(
      'Sticker',
      'fk_sticker_boardId_board',
    );

    await queryInterface.removeConstraint('Board', 'fk_board_authorId_user');

    await queryInterface.dropTable('BoardHistory');
    await queryInterface.dropTable('UsersBoards');
    await queryInterface.dropTable('Sticker');
    await queryInterface.dropTable('StickerMeta');
    await queryInterface.dropTable('Board');
    await queryInterface.dropTable('User');
  },
};
