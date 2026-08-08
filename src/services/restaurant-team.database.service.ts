import { Prisma, RestaurantRole } from '@prisma/client';
import { prisma } from '../config/database';
import { ConflictError } from '../utils/errors';

const memberInclude = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
} satisfies Prisma.RestaurantUserInclude;

export type RestaurantTeamMemberRecord = Prisma.RestaurantUserGetPayload<{
  include: typeof memberInclude;
}>;

export const findActiveMembershipByUserId = (userId: string) =>
  prisma.restaurantUser.findFirst({
    where: { userId, deletedAt: null },
    include: memberInclude,
  });

export const findActiveMembershipById = (id: string) =>
  prisma.restaurantUser.findFirst({
    where: { id, deletedAt: null },
    include: memberInclude,
  });

export const findRestaurantMembers = (restaurantId: string) =>
  prisma.restaurantUser.findMany({
    where: { restaurantId, deletedAt: null },
    include: memberInclude,
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
  });

export const findPendingInvitations = (restaurantId: string) =>
  prisma.restaurantInvitation.findMany({
    where: {
      restaurantId,
      acceptedAt: null,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

export const findPendingInvitationByEmail = (email: string) =>
  prisma.restaurantInvitation.findFirst({
    where: {
      email,
      acceptedAt: null,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

export const findInvitationByTokenHashForAcceptance = (tokenHash: string) =>
  prisma.restaurantInvitation.findFirst({
    where: {
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

export const createInvitation = (data: {
  email: string;
  restaurantId: string;
  role: RestaurantRole;
  tokenHash: string;
  invitedById: string;
  expiresAt: Date;
}) => prisma.restaurantInvitation.create({ data });

export const revokeInvitation = (id: string) =>
  prisma.restaurantInvitation.updateMany({
    where: { id, acceptedAt: null, revokedAt: null },
    data: { revokedAt: new Date() },
  });

export const updateMemberRole = (id: string, role: RestaurantRole) =>
  prisma.restaurantUser.update({
    where: { id },
    data: { role },
    include: memberInclude,
  });

export const softDeleteMember = (id: string) =>
  prisma.$transaction(async (transaction) => {
    const membership = await transaction.restaurantUser.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: memberInclude,
    });

    await transaction.user.update({
      where: { id: membership.userId },
      data: { role: 'user' },
    });

    return membership;
  });

export const acceptInvitation = async (data: {
  invitationId: string;
  email: string;
  restaurantId: string;
  role: RestaurantRole;
  ownershipId?: string;
  existingUserId?: string;
  newUser?: {
    firstName: string;
    lastName: string;
    password: string;
  };
}) =>
  prisma.$transaction(async (transaction) => {
    const claimedInvitation = await transaction.restaurantInvitation.updateMany({
      where: {
        id: data.invitationId,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { acceptedAt: new Date() },
    });

    if (claimedInvitation.count !== 1) {
      if (!data.ownershipId) {
        return null;
      }

      const acceptedOwnership = await transaction.restaurantOwnership.findFirst({
        where: {
          id: data.ownershipId,
          invitationId: data.invitationId,
          status: 'ACCEPTED',
          ownerUserId: { not: null },
        },
      });
      if (!acceptedOwnership?.ownerUserId) {
        return null;
      }
      if (data.existingUserId !== acceptedOwnership.ownerUserId) {
        return null;
      }

      const membership = await transaction.restaurantUser.findFirst({
        where: {
          restaurantId: acceptedOwnership.restaurantId,
          userId: acceptedOwnership.ownerUserId,
          role: 'super_admin',
          deletedAt: null,
        },
        include: memberInclude,
      });
      return membership ? { membership, ownership: acceptedOwnership } : null;
    }

    const user = data.existingUserId
      ? await transaction.user.update({
          where: { id: data.existingUserId },
          data: { role: 'restaurant_user' },
        })
      : await transaction.user.create({
          data: {
            email: data.email,
            firstName: data.newUser?.firstName ?? '',
            lastName: data.newUser?.lastName ?? '',
            password: data.newUser?.password ?? '',
            role: 'restaurant_user',
          },
        });

    const membership = await transaction.restaurantUser.create({
      data: {
        userId: user.id,
        restaurantId: data.restaurantId,
        role: data.role,
      },
      include: memberInclude,
    });

    let ownership = null;
    if (data.ownershipId) {
      const acceptedOwnership = await transaction.restaurantOwnership.updateMany({
        where: {
          id: data.ownershipId,
          invitationId: data.invitationId,
          status: 'INVITED',
        },
        data: {
          status: 'ACCEPTED',
          ownerUserId: user.id,
          acceptedAt: new Date(),
        },
      });

      if (acceptedOwnership.count !== 1) {
        throw new ConflictError('Restaurant ownership invitation has already been claimed');
      }

      ownership = await transaction.restaurantOwnership.findUnique({
        where: { id: data.ownershipId },
      });
    }

    return { membership, ownership };
  });
