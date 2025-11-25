import { Options } from 'sequelize';
import { postgresConfig } from '../env.js';

const database: Options = {
  ...postgresConfig,
  dialect: 'postgres',
  logging: false,
};

export default database;
