import { Options } from 'sequelize';
import { postgresConfig } from '../config.js';

const database: Options = {
  ...postgresConfig,
  dialect: 'postgres',
  logging: false,
  sync: { alter: true, force: true },
};

export default database;
