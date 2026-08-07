import { Prisma } from '@prisma/client';
import { prisma, isPrismaErrorWithCode } from '../config/database';
import { PRISMA_CODE } from '../utils/constants';
import { ConflictError } from '../utils/errors';
import { hashPassword } from '../utils/password';

export type ProvisionRestaurantOwnerInput = {
  restaurantId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const ownerInclude = {
  user: {
    omit: {
      password: true,
    },
  },
} satisfies Prisma.RestaurantUserInclude;

export const provisionRestaurantOwner = async (input: ProvisionRestaurantOwnerInput) => {
  const email = input.email.trim().toLowerCase();
  const hashedPassword = await hashPassword(input.password);

  try {
    return await prisma.$transaction(async (transaction) => {
      // Serialize provisioning for one restaurant without holding a cross-service lock.
      await transaction.$queryRaw<unknown[]>`
        SELECT pg_advisory_xact_lock(hashtextextended(${input.restaurantId}, 0))
      `;

      const existingOwner = await transaction.restaurantUser.findFirst({
        where: {
          restaurantId: input.restaurantId,
          role: 'super_admin',
          deletedAt: null,
        },
        include: ownerInclude,
      });

      if (existingOwner) {
        if (existingOwner.user.email.toLowerCase() !== email) {
          throw new ConflictError('This restaurant already has an owner');
        }

        return {
          user: existingOwner.user,
          membership: existingOwner,
          created: false,
        };
      }

      const existingUser = await transaction.user.findFirst({
        where: { email, deletedAt: null },
        select: { id: true },
      });

      if (existingUser) {
        throw new ConflictError('Email is already in use');
      }

      const user = await transaction.user.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          email,
          password: hashedPassword,
          role: 'restaurant_user',
        },
        omit: { password: true },
      });

      const membership = await transaction.restaurantUser.create({
        data: {
          userId: user.id,
          restaurantId: input.restaurantId,
          role: 'super_admin',
        },
      });

      return { user, membership, created: true };
    });
  } catch (error) {
    if (isPrismaErrorWithCode(error, PRISMA_CODE.CONFLICT)) {
      throw new ConflictError(
        'Restaurant owner could not be provisioned because it already exists'
      );
    }
    throw error;
  }
};
