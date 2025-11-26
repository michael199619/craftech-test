'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn('BoardHistory', 'entityName', {
      type: DataTypes.ENUM('BOARD', 'STICKER', 'STICKER_META'),
      allowNull: false,
      defaultValue: 'BOARD',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('BoardHistory', 'entityName');
  },
};
