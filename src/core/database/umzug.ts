import { Sequelize } from 'sequelize';
import { SequelizeStorage, Umzug } from 'umzug';
import logger from '../logger.js';
import sequelize from './database.js';

export const umzug = new Umzug({
  migrations: {
    glob: 'migrations/*.cjs',

    resolve: ({ name, path: filePath, context }) => {
      return {
        name,
        up: async () => {
          const migration = (await import(filePath!)).default;
          await migration.up(context, Sequelize);
        },
        down: async () => {
          const migration = (await import(filePath!)).default;
          await migration.down(context, Sequelize);
        },
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: logger,
});
