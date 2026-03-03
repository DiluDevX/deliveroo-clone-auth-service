import { Prisma, User } from '../../generated/prisma/client';
import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';
import { hashPassword } from '../utils/password';

export const findManyWithoutPassword = async (
  where: Prisma.UserWhereInput
): Promise<Omit<User, 'password'>[]> => {
  const users = await prisma.user.findMany({
    where: where,
    omit: {
      password: true,
    },
  });

  return users;
};

export const findManyWithPassword = async (where: Prisma.UserWhereInput): Promise<User[]> => {
  const users = await prisma.user.findMany({
    where: where,
  });

  return users;
};

export const findOneWithoutPassword = async (
  where: Prisma.UserWhereUniqueInput | { email: string }
): Promise<Omit<User, 'password'> | null> => {
  return prisma.user.findFirst({
    where: {
      ...where,
      deletedAt: null,
    } as Prisma.UserWhereInput,
    omit: {
      password: true,
    },
  });
};

export const findOneWithPassword = async (
  where: Prisma.UserWhereUniqueInput | { email: string }
): Promise<User | null> => {
  return prisma.user.findFirst({
    where: {
      ...where,
      deletedAt: null,
    } as Prisma.UserWhereInput,
  });
};

export const findUserById = async (id: string): Promise<User | null> => {
  return prisma.user.findFirst({
    where: { id, deletedAt: null },
  });
};

export const create = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}): Promise<Omit<User, 'password'>> => {
  const hashedPassword = await hashPassword(data.password);

  const createdUser = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  });
  const { password: _, ...userWithoutPassword } = createdUser;
  return userWithoutPassword;
};

export const updateUserPartially = async (
  userId: string,
  data: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: 'user' | 'platform_admin' | 'restaurant_user';
    password: string;
  }>
): Promise<Omit<User, 'password'> | null> => {
  try {
    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      omit: {
        password: true,
      },
    });

    return updatedUser;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new NotFoundError('User not found');
    }
    throw error;
  }
};

export const softDeleteUser = async (userId: string) => {
  const now = new Date();
  const deleteUser = prisma.user.update({
    where: { id: userId },
    data: { deletedAt: now },
  });

  const deleteAllRestaurantUsers = prisma.restaurantUser.updateMany({
    where: { userId: userId, deletedAt: null },
    data: { deletedAt: now },
  });

  try {
    await prisma.$transaction([deleteUser, deleteAllRestaurantUsers]);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new NotFoundError('User not found');
    }
    throw error;
  }
};
