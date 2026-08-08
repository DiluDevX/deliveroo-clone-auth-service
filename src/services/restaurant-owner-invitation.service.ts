import crypto from 'node:crypto';
import dayjs from 'dayjs';
import { environment } from '../config/environment';
import { isPrismaErrorWithCode } from '../config/database';
import { PRISMA_CODE } from '../utils/constants';
import { ConflictError } from '../utils/errors';
import { hashToken } from '../utils/jwt';
import * as emailService from './email.service';
import * as restaurantOwnershipDatabaseService from './restaurant-ownership.database.service';

export type CreateRestaurantOwnerInvitationInput = {
  restaurantId: string;
  restaurantName: string;
  provisioningId: string;
  firstName: string;
  lastName: string;
  email: string;
};

export const createRestaurantOwnerInvitation = async (
  input: CreateRestaurantOwnerInvitationInput,
  invitedById: string
) => {
  const email = input.email.trim().toLowerCase();
  const token = crypto.randomBytes(32).toString('hex');

  let reservation;
  try {
    reservation = await restaurantOwnershipDatabaseService.reserveRestaurantOwnership({
      ...input,
      email,
      invitedById,
      tokenHash: hashToken(token),
      expiresAt: dayjs().add(environment.restaurantInvitationExpiresInDays, 'days').toDate(),
    });
  } catch (error) {
    if (isPrismaErrorWithCode(error, PRISMA_CODE.CONFLICT)) {
      throw new ConflictError('Restaurant ownership is already reserved');
    }
    throw error;
  }

  const { ownership, invitationCreated } = reservation;
  if (invitationCreated) {
    try {
      await emailService.sendRestaurantInvitationEmail(
        email,
        token,
        'super_admin',
        input.restaurantName
      );
    } catch (error) {
      await restaurantOwnershipDatabaseService.revokeOwnershipInvitation(ownership.invitation.id);
      throw error;
    }
  }

  return {
    ownership: {
      id: ownership.id,
      restaurantId: ownership.restaurantId,
      provisioningId: ownership.provisioningId,
      status: ownership.status,
    },
    invitation: {
      id: ownership.invitation.id,
      email: ownership.invitation.email,
      expiresAt: ownership.invitation.expiresAt,
    },
    created: invitationCreated,
  };
};
