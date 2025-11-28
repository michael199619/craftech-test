import { paths } from '../../core/types/api-types.js';

export type CreateWorkspaceDto =
  paths['/workspaces']['post']['requestBody']['content']['application/json'] & {
    authorId: string;
  };

export type UpdateWorkspaceDto =
  paths['/workspaces/{id}']['put']['requestBody']['content']['application/json'] & {};

export type WorkspaceResponse = Omit<
  paths['/workspaces/{id}']['put']['responses']['200']['content']['application/json'],
  'createdAt'
> & {
  createdAt: Date;
};

export type WorkspaceResponseWithBoards = Omit<
  paths['/workspaces/{id}']['get']['responses']['200']['content']['application/json'],
  'createdAt'
> & {
  createdAt: Date;
};

export type GetAllResponse =
  paths['/workspaces']['get']['responses']['200']['content']['application/json'] & {};
