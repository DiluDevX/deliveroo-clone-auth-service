import z from 'zod';
import {
  addressRequestBodySchema,
  createRestaurantOwnerInvitationRequestBodySchema,
  createUserRequestBodySchema,
  updateAddressRequestBodySchema,
  updateUserRequestBodySchema,
} from '../schema/user.schema';
import { Address, RestaurantOwnershipStatus, RestaurantRole, User } from '@prisma/client';

export type GetAllUsersResponseBodyDTO = Omit<User, 'password'>[];

export type GetSingleUserResponseBodyDTO = Omit<User, 'password'>;

export type RestaurantAssignmentDTO = {
  id: string;
  restaurantId: string;
  role: RestaurantRole;
};

export type GetUserProfileResponseBodyDTO = Omit<
  User,
  'password' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'restaurantUsers'
> & {
  restaurantId?: string;
  restaurantRole?: RestaurantRole;
  restaurantUsers: RestaurantAssignmentDTO[];
};

export type CreateUserRequestBodyDTO = z.infer<typeof createUserRequestBodySchema>;

export type CreateUserResponseBodyDTO = Omit<User, 'password'>;

export type CreateRestaurantOwnerInvitationRequestBodyDTO = z.infer<
  typeof createRestaurantOwnerInvitationRequestBodySchema
>;

export type CreateRestaurantOwnerInvitationResponseBodyDTO = {
  ownership: {
    id: string;
    restaurantId: string;
    provisioningId: string;
    status: RestaurantOwnershipStatus;
  };
  invitation: {
    id: string;
    email: string;
    expiresAt: Date;
  };
  created: boolean;
};

export type UpdateUserRequestBodyDTO = z.infer<typeof updateUserRequestBodySchema>;

export type UpdateUserResponseBodyDTO = Omit<User, 'password'>;

export type DeleteUserResponseBodyDTO = Omit<User, 'password'>;

export type AddressResponseBodyDTO = Address;

export type GetUserAddressesResponseBodyDTO = AddressResponseBodyDTO[];

export type CreateAddressRequestBodyDTO = z.infer<typeof addressRequestBodySchema>;

export type CreateAddressResponseBodyDTO = AddressResponseBodyDTO;

export type UpdateAddressRequestBodyDTO = z.infer<typeof updateAddressRequestBodySchema>;

export type UpdateAddressResponseBodyDTO = AddressResponseBodyDTO;

export type DeleteAddressResponseBodyDTO = {
  id: string;
};
