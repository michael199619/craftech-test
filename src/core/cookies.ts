import { Request, Response } from 'express';

export interface Session {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

export function setSession(res: Response, session: Session) {
  res.cookie('access_token', session.accessToken);
  res.cookie('refresh_token', session.refreshToken);
  res.cookie('user_id', session.userId);
}

export function getSession(req: Request): Session | null {
  const userId = req.cookies['user_id'];

  return userId
    ? {
        accessToken: req.cookies['access_token'],
        refreshToken: req.cookies['refresh_token'],
        userId,
      }
    : null;
}

export function clearSession(res: Response) {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.clearCookie('user_id');
}
