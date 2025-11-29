'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn('StickerMeta', 'stickerId', {
      type: DataTypes.UUID,
      allowNull: true,
    });

    await queryInterface.sequelize.query(`
      UPDATE "StickerMeta" sm
      SET "stickerId" = s.id
      FROM "Sticker" s
      WHERE s."stickerMetaId" = sm.id
    `);

    await queryInterface.changeColumn('StickerMeta', 'stickerId', {
      type: DataTypes.UUID,
      allowNull: false,
    });

    await queryInterface.removeConstraint(
      'Sticker',
      'fk_sticker_stickerMetaId_stickerMeta',
    );

    await queryInterface.removeColumn('Sticker', 'stickerMetaId');

    await queryInterface.addConstraint('StickerMeta', {
      fields: ['stickerId'],
      type: 'foreign key',
      references: { table: 'Sticker', field: 'id' },
      name: 'fk_stickerMeta_stickerId_sticker',
      onUpdate: 'NO ACTION',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('StickerMeta', {
      fields: ['stickerId'],
      type: 'unique',
      name: 'uq_stickerMeta_stickerId',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint(
      'StickerMeta',
      'uq_stickerMeta_stickerId',
    );

    await queryInterface.removeConstraint(
      'StickerMeta',
      'fk_stickerMeta_stickerId_sticker',
    );

    await queryInterface.addColumn('Sticker', 'stickerMetaId', {
      type: DataTypes.UUID,
      allowNull: true,
    });

    await queryInterface.sequelize.query(`
      UPDATE "Sticker" s
      SET "stickerMetaId" = sm.id
      FROM "StickerMeta" sm
      WHERE sm."stickerId" = s.id
    `);

    await queryInterface.changeColumn('Sticker', 'stickerMetaId', {
      type: DataTypes.UUID,
      allowNull: false,
    });

    await queryInterface.addConstraint('Sticker', {
      fields: ['stickerMetaId'],
      type: 'foreign key',
      references: { table: 'StickerMeta', field: 'id' },
      name: 'fk_sticker_stickerMetaId_stickerMeta',
      onUpdate: 'NO ACTION',
      onDelete: 'NO ACTION',
    });

    await queryInterface.removeColumn('StickerMeta', 'stickerId');
  },
};
