import { Prisma, RestaurantRole } from '@prisma/client';
import { prisma } from '../config/database';

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

export const findInvitationByTokenHash = (tokenHash: string) =>
  prisma.restaurantInvitation.findFirst({
    where: {
      tokenHash,
      acceptedAt: null,
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
      return null;
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

    return membership;
  });
