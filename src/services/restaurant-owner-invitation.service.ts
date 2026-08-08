import crypto from 'node:crypto';
import dayjs from 'dayjs';
import { environment } from '../config/environment';
import { isPrismaErrorWithCode } from '../config/database';
import { PRISMA_CODE } from '../utils/constants';
import { ConflictError } from '../utils/errors';
import { hashToken } from '../utils/jwt';
import { logger } from '../utils/logger';
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

const reserveRestaurantOwnershipAndMapDatabaseConflicts = async (
  input: CreateRestaurantOwnerInvitationInput,
  invitedById: string,
  email: string,
  tokenHash: string,
  expiresAt: Date
) => {
  try {
    return await restaurantOwnershipDatabaseService.reserveRestaurantOwnership({
      restaurantId: input.restaurantId,
      provisioningId: input.provisioningId,
      firstName: input.firstName,
      lastName: input.lastName,
      email,
      invitedById,
      tokenHash,
      expiresAt,
    });
  } catch (error) {
    if (isPrismaErrorWithCode(error, PRISMA_CODE.CONFLICT)) {
      throw new ConflictError('Restaurant ownership is already reserved');
    }
    throw error;
  }
};

export const createRestaurantOwnerInvitation = async (
  input: CreateRestaurantOwnerInvitationInput,
  invitedById: string
) => {
  const email = input.email.trim().toLowerCase();
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = dayjs().add(environment.restaurantInvitationExpiresInDays, 'days').toDate();

  const reservation = await reserveRestaurantOwnershipAndMapDatabaseConflicts(
    input,
    invitedById,
    email,
    hashToken(token),
    expiresAt
  );

  const { ownership, invitationCreated } = reservation;
  if (invitationCreated) {
    try {
      await emailService.sendRestaurantInvitationEmail(
        email,
        token,
        'super_admin',
        ownership.invitation.expiresAt,
        input.restaurantName
      );
    } catch (error) {
      try {
        await restaurantOwnershipDatabaseService.revokeOwnershipInvitation(ownership.invitation.id);
      } catch (compensationError) {
        logger.error(
          {
            invitationId: ownership.invitation.id,
            restaurantId: ownership.restaurantId,
            error:
              compensationError instanceof Error
                ? compensationError.message
                : 'Unknown compensation error',
          },
          'Failed to revoke restaurant owner invitation after email delivery failure'
        );
      }
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
