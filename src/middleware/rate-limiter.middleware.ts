import rateLimit from 'express-rate-limit';
import { environment } from '../config/environment';
import { EnvironmentEnum } from '../utils/constants';

const RATE_LIMIT = {
  [EnvironmentEnum.Production]: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },
  [EnvironmentEnum.Development]: {
    windowMs: 15 * 60 * 1000,
    max: 1000,
  },
  [EnvironmentEnum.Test]: {
    windowMs: 1 * 60 * 1000,
    max: 10000,
  },
};

export const rateLimiterMiddleware = rateLimit({
  windowMs: RATE_LIMIT[environment.env].windowMs,
  max: RATE_LIMIT[environment.env].max,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
