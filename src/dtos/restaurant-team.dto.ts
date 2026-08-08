import { RestaurantRole } from '@prisma/client';
import { z } from 'zod';
import {
  acceptRestaurantInvitationRequestBodySchema,
  createRestaurantInvitationRequestBodySchema,
  restaurantInvitationTokenPathParamsSchema,
  restaurantTeamResourcePathParamsSchema,
  updateRestaurantMemberRoleRequestBodySchema,
} from '../schema/restaurant-team.schema';

export type RestaurantTeamMemberDTO = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: RestaurantRole;
  createdAt: Date;
};

export type RestaurantTeamInvitationDTO = {
  id: string;
  email: string;
  role: RestaurantRole;
  expiresAt: Date;
  createdAt: Date;
};

export type RestaurantTeamResponseBodyDTO = {
  members: RestaurantTeamMemberDTO[];
  invitations: RestaurantTeamInvitationDTO[];
  grantableRoles: RestaurantRole[];
};

export type CreateRestaurantInvitationRequestBodyDTO = z.infer<
  typeof createRestaurantInvitationRequestBodySchema
>;
export type UpdateRestaurantMemberRoleRequestBodyDTO = z.infer<
  typeof updateRestaurantMemberRoleRequestBodySchema
>;
export type RestaurantTeamResourcePathParamsDTO = z.infer<
  typeof restaurantTeamResourcePathParamsSchema
>;
export type RestaurantInvitationTokenPathParamsDTO = z.infer<
  typeof restaurantInvitationTokenPathParamsSchema
>;
export type AcceptRestaurantInvitationRequestBodyDTO = z.infer<
  typeof acceptRestaurantInvitationRequestBodySchema
>;

export type RestaurantInvitationPreviewResponseBodyDTO = {
  email: string;
  role: RestaurantRole;
  expiresAt: Date;
  existingUser: boolean;
};

export type AcceptRestaurantInvitationResponseBodyDTO = {
  email: string;
  restaurantId: string;
  role: RestaurantRole;
  provisioningId?: string;
};
