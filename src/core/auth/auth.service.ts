import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config.js';
import logger from '../logger.js';
import redis from '../redis.js';
import { AuthOptions, RefreshPayload, TokenType } from './auth.interface.js';

export class AuthService {
  constructor(private options: AuthOptions) {}

  private refreshKey(userId: string, jti: string) {
    return `auth:user:refresh:${userId}:${jti}`;
  }

  private accessRevokeKey(userId: string, jti: string) {
    return `auth:user:access-revoked:${userId}:${jti}`;
  }

  private sessionVersionKey(userId: string) {
    return `auth:user:session-version:${userId}`;
  }

  async getSessionVersion(userId: string): Promise<number> {
    const version = await redis.get(this.sessionVersionKey(userId));
    return version ? Number(version) : 1;
  }

  verifyBcrypt(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  getBcryptHashPassword(str: string, salt: number = 10) {
    return bcrypt.hash(str, salt);
  }

  async saveRefreshHash(
    userId: string,
    jti: string,
    token: string,
    exp: number,
  ) {
    const hash = await this.getBcryptHashPassword(token);
    const ttlSec = Math.max(1, exp - Math.floor(Date.now() / 1000));
    const key = this.refreshKey(userId, jti);
    await redis.set(key, hash, 'EX', ttlSec);
  }

  private async verify(password: string, hash: string) {
    const ok = await this.verifyBcrypt(password, hash);

    if (!ok) {
      throw new Error('Forbidden');
    }
  }

  verifyJwtToken(token: string) {
    return jwt.verify(token, this.options.jwtSecret) as RefreshPayload;
  }

  async login(userId: string, password: string, storedHash: string) {
    await this.verify(password, storedHash);

    const {
      accessToken,
      refreshToken,
      payload: { jti, exp },
    } = await this.signTokens(userId);

    await this.saveRefreshHash(userId, jti, refreshToken, exp!);

    return { accessToken, refreshToken, userId };
  }

  async refresh(userId: string, refreshToken: string) {
    let payload: RefreshPayload;

    try {
      payload = jwt.verify(
        refreshToken,
        this.options.jwtSecret,
      ) as RefreshPayload;

      if (payload.sub !== userId) throw new Error();
    } catch {
      throw new Error('Forbidden');
    }

    const key = this.refreshKey(userId, payload.jti);
    const storedHash = await redis.get(key);

    if (!storedHash) {
      throw new Error('Forbidden');
    }

    try {
      await this.verify(refreshToken, storedHash);
    } catch (e) {
      await redis.del(key);
      throw e;
    }

    await redis.del(key);

    const {
      payload: { jti, exp },
      ...tokens
    } = await this.signTokens(userId);

    await this.saveRefreshHash(userId, jti, tokens.refreshToken, exp!);

    return { ...tokens, userId };
  }

  async logout(userId: string, refreshToken: string) {
    try {
      const { sub, jti, exp } = this.verifyJwtToken(refreshToken);
      if (sub !== userId) return;

      await redis.del(this.refreshKey(userId, jti));

      const ttlSec = Math.max(1, exp! - Math.floor(Date.now() / 1000));
      await redis.set(this.accessRevokeKey(userId, jti), '1', 'EX', ttlSec);
    } catch (e) {
      logger.debug('logout error', e);
    }
  }

  async logoutAll(userId: string) {
    const pattern = this.refreshKey(userId, '*');
    const keys = await redis.keys(pattern);

    if (keys.length) {
      await redis.del(...keys);
    }

    const newVersion = await redis.incr(this.sessionVersionKey(userId));
    await redis.persist(this.sessionVersionKey(userId));

    return newVersion;
  }

  async validateAccess(
    userId: string,
    jti: string,
    sessionVersion: number | undefined,
  ) {
    const script = `
            local revoked = redis.call("GET", KEYS[1])
            local version = redis.call("GET", KEYS[2])

            if revoked then
                return "${TokenType.REVOKED}"
            end

            local currentVersion = tonumber(version) or 1
            local argVersion = tonumber(ARGV[1]) or 1

            if currentVersion ~= argVersion then
                return "${TokenType.INVALID_VERSION}"
            end

            return "${TokenType.OK}"
        `;

    const result = await redis.eval(
      script,
      2,
      this.accessRevokeKey(userId, jti),
      this.sessionVersionKey(userId),
      sessionVersion ?? 0,
    );

    return result as TokenType;
  }

  async signTokens(userId: string) {
    const jti = randomUUID();
    const sessionVersion = await this.getSessionVersion(userId);

    const payload: RefreshPayload = { sub: userId, jti, sessionVersion };

    const [accessToken, refreshToken] = await Promise.all([
      jwt.sign(payload, this.options.jwtSecret, {
        expiresIn: this.options.accessExpiresIn,
      }),
      jwt.sign(payload, this.options.jwtSecret, {
        expiresIn: this.options.refreshExpiresIn,
      }),
    ]);

    const decoded = jwt.decode(refreshToken) as RefreshPayload;
    payload.exp = decoded.exp;

    return { accessToken, refreshToken, payload };
  }
}

export default new AuthService({
  accessExpiresIn: jwtConfig.access,
  refreshExpiresIn: jwtConfig.refresh,
  jwtSecret: jwtConfig.secret,
});
