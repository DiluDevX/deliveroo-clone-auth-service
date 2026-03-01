import { Router } from 'express';
import authRoutes from './v1/auth.routes';
import userRoutes from './v1/user.routes';
import commonRoutes from './common.routes';

const router = Router();

router.use('/v1/auth', authRoutes);
router.use('/v1/users', userRoutes);
router.use(commonRoutes);

export default router;
