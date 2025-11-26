import cookieParser from 'cookie-parser';
import express, { Router } from 'express';
import { errorHandler } from './core/error-handler.js';
import { logger } from './core/logger.js';
import { setupSwagger } from './core/swagger.js';
import { initWebSocket } from './core/websocket/index.js';

import { authGuard } from './core/auth/auth.guard.js';
import authRouter from './modules/auth/auth.router.js';
import boardsRouter from './modules/boards/boards.router.js';
import stickersRouter from './modules/stickers/stickers.router.js';
import usersRouter from './modules/users/users.router.js';
import workspacesRouter from './modules/workspaces/workspaces.router.js';

import { appConfig } from './core/config.js';
import { umzug } from './core/database/umzug.js';

import './modules/boards/index.js';
import './modules/stickers/index.js';
import './modules/users/index.js';

export async function bootstrap() {
  try {
    await umzug.up();
    logger.info('Migration completed');
  } catch (e) {
    logger.error('Migration error', { error: e });
    throw e;
  }

  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  setupSwagger(app);

  const api = Router();
  api.use('/auth', authRouter);
  api.use('/workspaces', authGuard, workspacesRouter);
  api.use('/users', authGuard, usersRouter);
  api.use('/boards', authGuard, boardsRouter);
  api.use('/stickers', authGuard, stickersRouter);

  app.use(appConfig.prefixApi, api);

  app.use(errorHandler);

  const server = app.listen(appConfig.port, () =>
    logger.info(
      `Application started at http://localhost:${appConfig.port}/${appConfig.prefixApi}/docs`,
    ),
  );

  initWebSocket(server);
}

bootstrap().catch((error) =>
  logger.error('Failed to start application', { error }),
);
