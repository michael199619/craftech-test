import { Sequelize } from 'sequelize';
import database from './sequelize.config.js';

export const sequelize = new Sequelize(database);

export default sequelize;
