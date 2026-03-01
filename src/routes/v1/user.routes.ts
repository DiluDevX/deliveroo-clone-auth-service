import { Router } from 'express';
import * as userController from '../../controllers/v1/user.controller';

import { validateBody, validateParams } from '../../middleware/validate.middleware';
import { idRequestPathParamsSchema } from '../../schema/common.schema';
import { createUserRequestBodySchema, updateUserRequestBodySchema } from '../../schema/user.schema';

const router = Router();

router.get('/', userController.getAllUsers); // TODO: add pagination, filtering, sorting, etc.

router.get('/:id', validateParams(idRequestPathParamsSchema), userController.getSingleUser);

router.post('/', validateBody(createUserRequestBodySchema), userController.createUser);

router.patch(
  '/:id',
  validateParams(idRequestPathParamsSchema),
  validateBody(updateUserRequestBodySchema),
  userController.updateUser
);

router.delete('/:id', validateParams(idRequestPathParamsSchema), userController.deleteUser);

export default router;
