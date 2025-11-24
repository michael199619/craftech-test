import { Request } from 'express';
import { UserResponse } from '../modules/users/users.dto.js';

export type Req<Params = {}, Body = {}, Query = {}> = Request<
  Params,
  {},
  Body,
  Query
> & {
  user: UserResponse;
};
