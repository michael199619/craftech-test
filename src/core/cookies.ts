import cookie from 'cookie';
import { Request, Response } from 'express';

export interface Session {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

export interface CookieSession {
  access_token: string;
  refresh_token: string;
  user_id: string;
}

export function setSession(res: Response, session: Session) {
  res.cookie('access_token', session.accessToken);
  res.cookie('refresh_token', session.refreshToken);
  res.cookie('user_id', session.userId);
}

export function getSession(req: Request): Session | null {
  const user = (req.cookies || cookie.parse(req.headers.cookie || '')) as
    | CookieSession
    | undefined;

  return user?.user_id
    ? {
        accessToken: user.access_token,
        refreshToken: user.refresh_token,
        userId: user.user_id,
      }
    : null;
}

export function clearSession(res: Response) {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.clearCookie('user_id');
}
