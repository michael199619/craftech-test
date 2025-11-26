import { UserResponse } from '../../modules/users/users.dto.ts';

// For request
declare global {
  namespace Express {
    interface Request {
      user?: UserResponse;
    }
  }
}
