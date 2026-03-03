import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';
import { AuthenticatedRequest } from './authentication.middleware';

export function requireRoles(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      return next(new ForbiddenError('Authentication required'));
    }

    if (!allowedRoles.includes(user.role)) {
      return next(new ForbiddenError(`Access denied. Required roles: ${allowedRoles.join(', ')}`));
    }

    next();
  };
}

export function requireOwnerOrRoles(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      return next(new ForbiddenError('Authentication required'));
    }

    if (allowedRoles.includes(user.role)) {
      return next();
    }

    const resourceUserId = req.params.id || req.body.userId;

    if (resourceUserId && resourceUserId === user.userId) {
      return next();
    }

    return next(new ForbiddenError('Access denied. You can only access your own resources'));
  };
}
