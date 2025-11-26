import { Express } from 'express';
import path from 'path';
import {
  default as swaggerJsdoc,
  default as swaggerJSDoc,
} from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import { appConfig } from './config.js';
import { NodeEnv } from './enums.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function setupSwagger(app: Express) {
  const options: swaggerJSDoc.Options = {
    definition: {
      openapi: '3.0.1',
      info: {
        title: 'Api for boards',
        version: '0.1.0',
      },
      components: {
        schemas: {
          UserResponse: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              login: { type: 'string' },
              status: { type: 'string' },
            },
          },
          BoardResponse: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              authorId: { type: 'string', format: 'uuid' },
              workspaceId: { type: 'string', format: 'uuid' },
              private: { type: 'boolean' },
            },
          },
          BoardWithStickersResponse: {
            allOf: [
              { $ref: '#/components/schemas/BoardResponse' },
              {
                type: 'object',
                properties: {
                  maxWidth: { type: 'number' },
                  maxHeight: { type: 'number' },
                  stickers: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        meta: {
                          type: 'object',
                          properties: {
                            positionX: { type: 'number' },
                            positionY: { type: 'number' },
                            width: { type: 'number' },
                            height: { type: 'number' },
                            index: { type: 'number' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            ],
          },
          StickerResponse: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              description: { type: 'string' },
              boardId: { type: 'string', format: 'uuid' },
              stickerMetaId: { type: 'string', format: 'uuid' },
              meta: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  positionX: { type: 'number' },
                  positionY: { type: 'number' },
                  index: { type: 'number' },
                  width: { type: 'number' },
                  height: { type: 'number' },
                },
              },
            },
          },
          WorkspaceResponse: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              authorId: { type: 'string', format: 'uuid' },
            },
          },
          AuthResponse: {
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
              userId: { type: 'string', format: 'uuid' },
            },
          },
          Pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              limit: { type: 'integer' },
              total: { type: 'integer' },
              totalPages: { type: 'integer' },
            },
          },
          History: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              boardId: { type: 'string', format: 'uuid' },
              entityId: { type: 'string', format: 'uuid' },
              authorId: { type: 'string', format: 'uuid' },
              key: { type: 'string' },
              operation: { type: 'string' },
              oldValue: { type: 'string' },
              newValue: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },

    apis: [path.join(__dirname, '../modules/**/*.js')], // todo: исправить
  };

  if (appConfig.prefixApi) {
    options.definition!.servers = [
      {
        url: appConfig.prefixApi,
      },
    ];
  }

  const spec = swaggerJsdoc(options);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));

  if (appConfig.nodeEnv === NodeEnv.DEV) {
    app.get('/docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(spec);
    });
  }
}
