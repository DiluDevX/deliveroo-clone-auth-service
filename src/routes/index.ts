import { Router } from 'express';
import authRoutes from './v1/auth.routes';
import userRoutes from './v1/user.routes';
import commonRoutes from './common.routes';
import { apiKeyMiddleware } from '../middleware/api-key.middleware';
import { environment } from '../config/environment';

const router = Router();

router.use('/v1/auth', apiKeyMiddleware([environment.deliverooCloneAPIKey]), authRoutes);
router.use('/v1/users', apiKeyMiddleware([environment.deliverooCloneAPIKey]), userRoutes);
router.use(commonRoutes);

export default router;
