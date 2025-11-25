'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('User', 'registrationCode');
  },

  async down(queryInterface) {
    await queryInterface.addColumn('User', 'registrationCode', {
      type: DataTypes.STRING(255),
      comment: 'код нужен для привязки анонима',
    });
  },
};
