import { Sequelize } from 'sequelize';
import { SequelizeStorage, Umzug } from 'umzug';
import sequelize from './database.js';

export const umzug = new Umzug({
  migrations: {
    glob: 'migrations/*.cjs',

    resolve: ({ name, path: filePath, context }) => {
      return {
        name,
        up: async () => {
          const migration = (await import(filePath!)).default;
          migration.up(context, Sequelize);
        },
        down: async () => {
          const migration = (await import(filePath!)).default;
          migration.down(context, Sequelize);
        },
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});
