import { Options } from 'sequelize';
import { postgresConfig } from '../config.js';

const database: Options = {
  ...postgresConfig,
  dialect: 'postgres',
  logging: false,
};

export default database;
