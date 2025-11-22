import { Express } from 'express';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function setupSwagger(app: Express) {
  const options = {
    definition: {
      openapi: '3.0.1',
      info: {
        title: 'Api for boards',
        version: '0.1.0',
      },
    },

    apis: [path.join(__dirname, '../modules/**/*.js')],
  };

  const spec = swaggerJsdoc(options);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
}
