import { Options } from 'sequelize';
import { postgresConfig } from '../config.js';
import logger from '../logger.js';

const database: Options = {
  ...postgresConfig,
  dialect: 'postgres',
  logging: (str) => logger.debug(str),
};

export default database;
