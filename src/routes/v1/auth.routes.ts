import { Router } from 'express';
import * as authController from '../../controllers/v1/auth.controller';
import { validateBody } from '../../middleware/validate.middleware';
import { authenticateJwt } from '../../middleware/authentication.middleware';
import {
  changePasswordRequestBodySchema,
  checkEmailRequestBodySchema,
  forgotPasswordRequestBodySchema,
  loginRequestBodySchema,
  logoutRequestBodySchema,
  refreshTokenRequestBodySchema,
  verifyResetPasswordTokenRequestBodySchema,
  signUpRequestBodySchema,
  resetPasswordRequestBodySchema,
} from '../../schema/auth.schema';
import * as restaurantTeamController from '../../controllers/v1/restaurant-team.controller';
import {
  acceptRestaurantInvitationRequestBodySchema,
  restaurantInvitationTokenPathParamsSchema,
} from '../../schema/restaurant-team.schema';
import { validateParams } from '../../middleware/validate.middleware';

const router = Router();

router.get('/me', authenticateJwt, authController.getMe);

router.post('/check-email', validateBody(checkEmailRequestBodySchema), authController.checkEmail);

router.post('/signup', validateBody(signUpRequestBodySchema), authController.signup);

router.post('/login', validateBody(loginRequestBodySchema), authController.login);

router.post('/logout', validateBody(logoutRequestBodySchema), authController.logout);

router.post('/refresh', validateBody(refreshTokenRequestBodySchema), authController.refreshToken);

router.post(
  '/forgot-password',
  validateBody(forgotPasswordRequestBodySchema),
  authController.forgotPassword
);

router.get(
  '/restaurant-invitations/:token',
  validateParams(restaurantInvitationTokenPathParamsSchema),
  restaurantTeamController.getRestaurantInvitationPreview
);

router.post(
  '/restaurant-invitations/:token/accept',
  validateParams(restaurantInvitationTokenPathParamsSchema),
  validateBody(acceptRestaurantInvitationRequestBodySchema),
  restaurantTeamController.acceptRestaurantInvitation
);

router.post(
  '/reset-password/verify',
  validateBody(verifyResetPasswordTokenRequestBodySchema),
  authController.verifyResetPasswordToken
);

router.post(
  '/reset-password/update',
  validateBody(resetPasswordRequestBodySchema),
  authController.resetPassword
);

router.post(
  '/change-password',
  authenticateJwt,
  validateBody(changePasswordRequestBodySchema),
  authController.changePassword
);

export default router;
