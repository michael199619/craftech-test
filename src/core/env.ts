import dotenv from "dotenv";
import env from "env-var";

dotenv.config();

export const appConfig = {
  port: env.get("PORT").default("3000").asPortNumber(),
  nodeEnv: env.get("NODE_ENV").default("development").asString(),
};

export const redisConfig = {
  host: env.get("REDIS_HOST").default("localhost").asString(),
  port: env.get("REDIS_PORT").default("6379").asPortNumber(),
  password: env.get("REDIS_PASSWORD").asString(),
};

export const postgresConfig = {
  host: env.get("POSTGRES_HOST").default("localhost").asString(),
  port: env.get("POSTGRES_PORT").default("5432").asPortNumber(),
  password: env.get("POSTGRES_PASSWORD").asString(),
  username: env.get("POSTGRES_USER").asString(),
  database: env.get("POSTGRES_NAME").asString(),
};

export const jwtConfig = {
  secret: env.get("JWT_SECRET").default("your-super-secret-jwt-key").asString(),
  expiresIn: env.get("JWT_EXPIRES_IN").default("24h").asString(),
};
