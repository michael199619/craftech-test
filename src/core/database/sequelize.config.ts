import { Options } from 'sequelize';
import { postgresConfig } from '../env.js';

const database: Options = {
  ...postgresConfig,
  dialect: 'postgres',
  logging: false,
  sync: { force: true, alter: true },
};

export default database;
