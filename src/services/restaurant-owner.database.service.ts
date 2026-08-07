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

type TransactionClient = Prisma.TransactionClient;
type ExistingOwner = Prisma.RestaurantUserGetPayload<{ include: typeof ownerInclude }>;

const acquireRestaurantProvisioningLock = async (
  transaction: TransactionClient,
  restaurantId: string
): Promise<void> => {
  await transaction.$queryRaw<unknown[]>`
    SELECT pg_advisory_xact_lock(hashtextextended(${restaurantId}, 0))
  `;
};

const findExistingOwner = (
  transaction: TransactionClient,
  restaurantId: string
): Promise<ExistingOwner | null> =>
  transaction.restaurantUser.findFirst({
    where: {
      restaurantId,
      role: 'super_admin',
      deletedAt: null,
    },
    include: ownerInclude,
  });

const resolveExistingOwner = (existingOwner: ExistingOwner | null, email: string) => {
  if (!existingOwner) {
    return null;
  }
  if (existingOwner.user.email.toLowerCase() !== email) {
    throw new ConflictError('This restaurant already has an owner');
  }

  return {
    user: existingOwner.user,
    membership: existingOwner,
    created: false as const,
  };
};

const createOwner = async (
  transaction: TransactionClient,
  input: ProvisionRestaurantOwnerInput,
  email: string,
  hashedPassword: string
) => {
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

  return { user, membership, created: true as const };
};

const provisionOwnerInTransaction = async (
  transaction: TransactionClient,
  input: ProvisionRestaurantOwnerInput,
  email: string,
  hashedPassword: string
) => {
  await acquireRestaurantProvisioningLock(transaction, input.restaurantId);

  const existingOwner = await findExistingOwner(transaction, input.restaurantId);
  const existingResult = resolveExistingOwner(existingOwner, email);
  return existingResult ?? createOwner(transaction, input, email, hashedPassword);
};

export const provisionRestaurantOwner = async (input: ProvisionRestaurantOwnerInput) => {
  const email = input.email.trim().toLowerCase();
  const hashedPassword = await hashPassword(input.password);

  try {
    return await prisma.$transaction((transaction) =>
      provisionOwnerInTransaction(transaction, input, email, hashedPassword)
    );
  } catch (error) {
    if (isPrismaErrorWithCode(error, PRISMA_CODE.CONFLICT)) {
      throw new ConflictError('Restaurant owner could not be provisioned due to conflicting data');
    }
    throw error;
  }
};
