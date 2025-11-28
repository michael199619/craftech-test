import { paths } from '../../core/types/api-types.js';
import { HistoryEntity, HistoryOperation } from './boards.model.js';

export type CreateBoardDto = Omit<
  paths['/boards']['post']['requestBody']['content']['application/json'],
  'authorId'
> & {
  authorId: string;
};

export type UpdateBoardDto =
  paths['/boards/{id}']['put']['requestBody']['content']['application/json'] & {};

export type BoardResponse =
  paths['/boards/{id}']['put']['responses']['200']['content']['application/json'] & {};

export type BoardWithStickersResponse =
  paths['/boards/{id}']['get']['responses']['200']['content']['application/json'] & {};

export type GetByIdDto =
  paths['/boards/{id}']['get']['parameters']['query'] & {};
export type GetAllResponse =
  paths['/boards']['get']['responses']['200']['content']['application/json'] & {};

export type GetHistoryResponse = Omit<
  paths['/boards/{id}/history']['get']['responses']['200']['content']['application/json'],
  'data'
> & {
  data: (Omit<
    paths['/boards/{id}/history']['get']['responses']['200']['content']['application/json']['data'][0],
    'createdAt'
  > & {
    createdAt: Date;
  })[];
};

export interface CreateHistoryDto {
  boardId: string;
  authorId?: string; // undefined - system
  operation: HistoryOperation;
  entityId: string;
  entityName: HistoryEntity;
  key?: string;
  newValue?: string;
  oldValue?: string;
}
