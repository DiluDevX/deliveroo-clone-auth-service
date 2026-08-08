import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { ConflictError } from '../utils/errors';

export type ReserveRestaurantOwnershipInput = {
  restaurantId: string;
  provisioningId: string;
  firstName: string;
  lastName: string;
  email: string;
  invitedById: string;
  tokenHash: string;
  expiresAt: Date;
};

const ownershipInclude = {
  invitation: true,
} satisfies Prisma.RestaurantOwnershipInclude;

type TransactionClient = Prisma.TransactionClient;
type OwnershipWithInvitation = Prisma.RestaurantOwnershipGetPayload<{
  include: typeof ownershipInclude;
}>;

const acquireOwnershipReservationLock = async (
  transaction: TransactionClient,
  restaurantId: string
): Promise<void> => {
  await transaction.$queryRaw<unknown[]>`
    SELECT pg_advisory_xact_lock(hashtextextended(${restaurantId}, 0))
  `;
};

const assertReservationMatchesRequest = (
  ownership: OwnershipWithInvitation,
  input: ReserveRestaurantOwnershipInput
): void => {
  const matches =
    ownership.restaurantId === input.restaurantId &&
    ownership.provisioningId === input.provisioningId &&
    ownership.ownerFirstName === input.firstName &&
    ownership.ownerLastName === input.lastName &&
    ownership.ownerEmail.toLowerCase() === input.email.toLowerCase();

  if (!matches) {
    throw new ConflictError('Restaurant ownership is already reserved with different details');
  }
};

const assertOwnerAccountCanBeReserved = async (
  transaction: TransactionClient,
  email: string
): Promise<void> => {
  const existingUser = await transaction.user.findFirst({
    where: { email, deletedAt: null },
    select: {
      role: true,
      restaurantUsers: {
        where: { deletedAt: null },
        select: { id: true },
        take: 1,
      },
    },
  });

  if (existingUser?.role === 'platform_admin') {
    throw new ConflictError('Platform administrators cannot own restaurants');
  }
  if (existingUser?.restaurantUsers.length) {
    throw new ConflictError('This account already belongs to a restaurant');
  }
};

const createOwnerInvitation = (
  transaction: TransactionClient,
  input: ReserveRestaurantOwnershipInput
) =>
  transaction.restaurantInvitation.create({
    data: {
      email: input.email,
      restaurantId: input.restaurantId,
      role: 'super_admin',
      tokenHash: input.tokenHash,
      invitedById: input.invitedById,
      expiresAt: input.expiresAt,
    },
  });

export const reserveRestaurantOwnership = async (input: ReserveRestaurantOwnershipInput) =>
  prisma.$transaction(async (transaction) => {
    await acquireOwnershipReservationLock(transaction, input.restaurantId);

    const existingOwnership = await transaction.restaurantOwnership.findFirst({
      where: {
        OR: [
          { restaurantId: input.restaurantId },
          { provisioningId: input.provisioningId },
          { ownerEmail: input.email },
        ],
      },
      include: ownershipInclude,
    });

    if (existingOwnership) {
      assertReservationMatchesRequest(existingOwnership, input);

      const invitationIsActive =
        existingOwnership.invitation.acceptedAt === null &&
        existingOwnership.invitation.revokedAt === null &&
        existingOwnership.invitation.expiresAt > new Date();

      if (existingOwnership.status === 'ACCEPTED' || invitationIsActive) {
        return { ownership: existingOwnership, invitationCreated: false };
      }

      await assertOwnerAccountCanBeReserved(transaction, input.email);
      await transaction.restaurantInvitation.updateMany({
        where: {
          id: existingOwnership.invitation.id,
          acceptedAt: null,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });
      const invitation = await createOwnerInvitation(transaction, input);
      const ownership = await transaction.restaurantOwnership.update({
        where: { id: existingOwnership.id },
        data: { invitationId: invitation.id },
        include: ownershipInclude,
      });
      return { ownership, invitationCreated: true };
    }

    await assertOwnerAccountCanBeReserved(transaction, input.email);
    const invitation = await createOwnerInvitation(transaction, input);
    const ownership = await transaction.restaurantOwnership.create({
      data: {
        restaurantId: input.restaurantId,
        provisioningId: input.provisioningId,
        ownerFirstName: input.firstName,
        ownerLastName: input.lastName,
        ownerEmail: input.email,
        invitationId: invitation.id,
      },
      include: ownershipInclude,
    });

    return { ownership, invitationCreated: true };
  });

export const revokeOwnershipInvitation = (invitationId: string) =>
  prisma.restaurantInvitation.updateMany({
    where: { id: invitationId, acceptedAt: null, revokedAt: null },
    data: { revokedAt: new Date() },
  });

export const findOwnershipByInvitationId = (invitationId: string) =>
  prisma.restaurantOwnership.findUnique({ where: { invitationId } });
