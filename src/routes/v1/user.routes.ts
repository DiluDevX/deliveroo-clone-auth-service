import { Router } from 'express';
import * as userController from '../../controllers/v1/user.controller';
import { validateBody, validateParams } from '../../middleware/validate.middleware';
import { authenticateJwt } from '../../middleware/authentication.middleware';
import { requireRoles, requireOwnerOrRoles } from '../../middleware/authorization.middleware';
import { idRequestPathParamsSchema } from '../../schema/common.schema';
import {
  addressRequestBodySchema,
  createUserRequestBodySchema,
  updateAddressRequestBodySchema,
  updateUserRequestBodySchema,
} from '../../schema/user.schema';

const router = Router();

router.get('/', authenticateJwt, requireRoles('platform_admin'), userController.getAllUsers);

router.get('/me/addresses', authenticateJwt, userController.getMyAddresses);

router.post(
  '/me/addresses',
  authenticateJwt,
  validateBody(addressRequestBodySchema),
  userController.createMyAddress
);

router.patch(
  '/me/addresses/:id',
  authenticateJwt,
  validateParams(idRequestPathParamsSchema),
  validateBody(updateAddressRequestBodySchema),
  userController.updateMyAddress
);

router.patch(
  '/me/addresses/:id/default',
  authenticateJwt,
  validateParams(idRequestPathParamsSchema),
  userController.setMyDefaultAddress
);

router.delete(
  '/me/addresses/:id',
  authenticateJwt,
  validateParams(idRequestPathParamsSchema),
  userController.deleteMyAddress
);

router.get(
  '/:id',
  authenticateJwt,
  validateParams(idRequestPathParamsSchema),
  requireOwnerOrRoles('platform_admin'),
  userController.getSingleUser
);

router.post(
  '/',
  authenticateJwt,
  validateBody(createUserRequestBodySchema),
  requireRoles('platform_admin'),
  userController.createUser
);

router.patch(
  '/:id',
  authenticateJwt,
  validateParams(idRequestPathParamsSchema),
  validateBody(updateUserRequestBodySchema),
  requireOwnerOrRoles('platform_admin'),
  userController.updateUser
);

router.delete(
  '/:id',
  authenticateJwt,
  validateParams(idRequestPathParamsSchema),
  requireRoles('platform_admin'),
  userController.deleteUser
);

export default router;
