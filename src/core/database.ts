import { Sequelize } from "sequelize";
import { postgresConfig } from "./env.js";

export const sequelize = new Sequelize({
  dialect: "postgres",
  logging: false,
  ...postgresConfig,
});

export default sequelize;
