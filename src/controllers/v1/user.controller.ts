import { Request, Response, NextFunction } from 'express';
import type {
  GetAllUsersResponseBodyDTO,
  GetSingleUserResponseBodyDTO,
  UpdateUserRequestBodyDTO,
  UpdateUserResponseBodyDTO,
  DeleteUserResponseBodyDTO,
  CreateUserRequestBodyDTO,
  CreateUserResponseBodyDTO,
  CreateRestaurantOwnerInvitationRequestBodyDTO,
  CreateRestaurantOwnerInvitationResponseBodyDTO,
  GetUserAddressesResponseBodyDTO,
  CreateAddressRequestBodyDTO,
  CreateAddressResponseBodyDTO,
  UpdateAddressRequestBodyDTO,
  UpdateAddressResponseBodyDTO,
  DeleteAddressResponseBodyDTO,
} from '../../dtos/user.dto';
import { CommonResponseDTO, IdRequestPathParamsDTO } from '../../dtos/common.dto';
import * as usersDatabaseService from '../../services/users.database.service';
import * as addressDatabaseService from '../../services/address.database.service';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../utils/errors';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../../utils/logger';
import { AuthenticatedRequest } from '../../middleware/authentication.middleware';
import * as restaurantOwnerInvitationService from '../../services/restaurant-owner-invitation.service';

const getAuthenticatedUserId = (req: unknown): string => {
  const userId = (req as AuthenticatedRequest).user?.userId;

  if (!userId) {
    throw new UnauthorizedError('User not found in token');
  }

  return userId;
};

export const getAllUsers = async (
  _req: Request, // TODO: add query params for filtering, pagination, etc.
  res: Response<CommonResponseDTO<GetAllUsersResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    const users = await usersDatabaseService.findManyWithoutPassword({ deletedAt: null });
    logger.info({ count: users.length }, 'Users retrieved successfully');
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
    });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to retrieve users'
    );
    next(error);
  }
};

export const getSingleUser = async (
  req: Request<IdRequestPathParamsDTO, CommonResponseDTO<GetSingleUserResponseBodyDTO>>,
  res: Response<CommonResponseDTO<GetSingleUserResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    const userId = req.params.id;

    const foundUser = await usersDatabaseService.findOneWithoutPassword({
      id: userId,
    });

    logger.info({ userId }, 'User found');

    if (!foundUser) {
      throw new NotFoundError('User not found');
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'User retrieved successfully',
      data: foundUser,
    });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to retrieve user'
    );
    next(error);
  }
};

export const createUser = async (
  req: Request<unknown, CommonResponseDTO<CreateUserResponseBodyDTO>, CreateUserRequestBodyDTO>,
  res: Response<CommonResponseDTO<CreateUserResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    const existingUser = await usersDatabaseService.findOneWithoutPassword({
      email: req.body.email,
    });

    if (existingUser) {
      throw new ConflictError('Email is already in use');
    }
    logger.info({ role: 'user' }, 'Creating new user');

    const createdUser = await usersDatabaseService.create({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      password: req.body.password,
    });

    logger.info({ userId: createdUser.id }, 'User created successfully');

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'User created successfully',
      data: createdUser,
    });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to create user'
    );
    next(error);
  }
};

export const createRestaurantOwnerInvitation = async (
  req: Request<
    unknown,
    CommonResponseDTO<CreateRestaurantOwnerInvitationResponseBodyDTO>,
    CreateRestaurantOwnerInvitationRequestBodyDTO
  >,
  res: Response<CommonResponseDTO<CreateRestaurantOwnerInvitationResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    const platformAdminUserId = getAuthenticatedUserId(req);
    const result = await restaurantOwnerInvitationService.createRestaurantOwnerInvitation(
      req.body,
      platformAdminUserId
    );

    logger.info(
      {
        ownershipId: result.ownership.id,
        restaurantId: result.ownership.restaurantId,
        invitationId: result.invitation.id,
        created: result.created,
      },
      'Restaurant owner invitation reserved'
    );

    res.status(result.created ? StatusCodes.CREATED : StatusCodes.OK).json({
      success: true,
      message: result.created
        ? 'Restaurant owner invitation sent successfully'
        : 'Restaurant ownership is already reserved',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request<IdRequestPathParamsDTO, UpdateUserResponseBodyDTO, UpdateUserRequestBodyDTO>,
  res: Response<CommonResponseDTO<UpdateUserResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    const userId = req.params.id;
    const user = await usersDatabaseService.updateUserPartially(userId, req.body);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    logger.info({ userId }, 'User updated successfully');

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to update user'
    );
    next(error);
  }
};

export const deleteUser = async (
  req: Request<IdRequestPathParamsDTO, DeleteUserResponseBodyDTO, unknown>,
  res: Response<CommonResponseDTO<DeleteUserResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    const userId = req.params.id;
    await usersDatabaseService.softDeleteUser(userId);
    logger.info({ userId }, 'User deleted successfully');
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to delete user'
    );
    next(error);
  }
};

export const getMyAddresses = async (
  req: Request<unknown, CommonResponseDTO<GetUserAddressesResponseBodyDTO>>,
  res: Response<CommonResponseDTO<GetUserAddressesResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const addresses = await addressDatabaseService.findUserAddresses(userId);

    logger.info({ userId, count: addresses.length }, 'User addresses retrieved successfully');

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Addresses retrieved successfully',
      data: addresses,
    });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to retrieve user addresses'
    );
    next(error);
  }
};

export const createMyAddress = async (
  req: Request<
    unknown,
    CommonResponseDTO<CreateAddressResponseBodyDTO>,
    CreateAddressRequestBodyDTO
  >,
  res: Response<CommonResponseDTO<CreateAddressResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const address = await addressDatabaseService.createUserAddress(userId, req.body);

    logger.info({ userId, addressId: address.id }, 'User address created successfully');

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Address created successfully',
      data: address,
    });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to create user address'
    );
    next(error);
  }
};

export const updateMyAddress = async (
  req: Request<
    IdRequestPathParamsDTO,
    CommonResponseDTO<UpdateAddressResponseBodyDTO>,
    UpdateAddressRequestBodyDTO
  >,
  res: Response<CommonResponseDTO<UpdateAddressResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const address = await addressDatabaseService.updateUserAddress(userId, req.params.id, req.body);

    logger.info({ userId, addressId: address.id }, 'User address updated successfully');

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Address updated successfully',
      data: address,
    });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to update user address'
    );
    next(error);
  }
};

export const setMyDefaultAddress = async (
  req: Request<IdRequestPathParamsDTO, CommonResponseDTO<UpdateAddressResponseBodyDTO>>,
  res: Response<CommonResponseDTO<UpdateAddressResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const address = await addressDatabaseService.setDefaultUserAddress(userId, req.params.id);

    logger.info({ userId, addressId: address.id }, 'Default user address updated successfully');

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Default address updated successfully',
      data: address,
    });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to update default user address'
    );
    next(error);
  }
};

export const deleteMyAddress = async (
  req: Request<IdRequestPathParamsDTO, CommonResponseDTO<DeleteAddressResponseBodyDTO>>,
  res: Response<CommonResponseDTO<DeleteAddressResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const address = await addressDatabaseService.softDeleteUserAddress(userId, req.params.id);

    logger.info({ userId, addressId: address.id }, 'User address deleted successfully');

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Address deleted successfully',
      data: {
        id: address.id,
      },
    });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to delete user address'
    );
    next(error);
  }
};
