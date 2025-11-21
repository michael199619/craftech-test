import express from 'express';
import { sequelize } from './core/database.js';
import { setupSwagger } from './core/swagger.js';
import { initWebSocket } from './core/websocket.js';

import boardsRouter from './modules/boards/boards.router.js';
import stickersRouter from './modules/stickers/stickers.router.js';
import usersRouter from './modules/users/users.router.js';

import { appConfig } from './core/env.js';
import './modules/users/index.js';

export async function createApp() {
  const app = express();

  app.use(express.json());

  try {
    await sequelize.sync({ alter: true });
    console.log('DB synced');
  } catch (err) {
    console.error('DB sync error', err);
    throw err;
  }

  setupSwagger(app);

  app.use('/users', usersRouter);
  app.use('/boards', boardsRouter);
  app.use('/stickers', stickersRouter);

  initWebSocket();

  app.listen(appConfig.port, () =>
    console.log(
      `application started at http://localhost:${appConfig.port}/docs`,
    ),
  );
}

createApp();
