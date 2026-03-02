import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors';
import { verifyToken, TokenPayload } from '../utils/jwt';

const AUTH_HEADER = 'authorization';
const BEARER_PREFIX = 'Bearer ';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}
export function authenticateJwt(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers[AUTH_HEADER];

  if (!authHeader || typeof authHeader !== 'string') {
    return next(new UnauthorizedError('Access token is required'));
  }

  if (!authHeader.startsWith(BEARER_PREFIX)) {
    return next(new UnauthorizedError('Invalid token format. Expected: Bearer <token>'));
  }

  const token = authHeader.slice(BEARER_PREFIX.length);

  try {
    const payload = verifyToken<TokenPayload>(token);
    (req as AuthenticatedRequest).user = payload;
    next();
  } catch (error) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token has expired'));
    }
    return next(new UnauthorizedError('Invalid token'));
  }
}
