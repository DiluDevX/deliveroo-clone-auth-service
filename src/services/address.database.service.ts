import { Address, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';

type AddressCreateInput = {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  instructions?: string;
  isDefault?: boolean;
};

type AddressUpdateInput = Partial<AddressCreateInput>;

const activeAddressWhere = (userId: string, addressId: string): Prisma.AddressWhereInput => ({
  id: addressId,
  userId,
  deletedAt: null,
});

export const findUserAddresses = async (userId: string): Promise<Address[]> => {
  return prisma.address.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
};

export const createUserAddress = async (
  userId: string,
  data: AddressCreateInput
): Promise<Address> => {
  return prisma.$transaction(async (tx) => {
    const existingAddressCount = await tx.address.count({
      where: {
        userId,
        deletedAt: null,
      },
    });
    const shouldSetDefault = data.isDefault === true || existingAddressCount === 0;

    if (shouldSetDefault) {
      await tx.address.updateMany({
        where: {
          userId,
          deletedAt: null,
        },
        data: {
          isDefault: false,
        },
      });
    }

    return tx.address.create({
      data: {
        userId,
        label: data.label,
        line1: data.line1,
        line2: data.line2,
        city: data.city,
        postcode: data.postcode,
        country: data.country,
        latitude: data.latitude,
        longitude: data.longitude,
        instructions: data.instructions,
        isDefault: shouldSetDefault,
      },
    });
  });
};

export const updateUserAddress = async (
  userId: string,
  addressId: string,
  data: AddressUpdateInput
): Promise<Address> => {
  return prisma.$transaction(async (tx) => {
    const existingAddress = await tx.address.findFirst({
      where: activeAddressWhere(userId, addressId),
    });

    if (!existingAddress) {
      throw new NotFoundError('Address not found');
    }

    if (data.isDefault === true) {
      await tx.address.updateMany({
        where: {
          userId,
          deletedAt: null,
        },
        data: {
          isDefault: false,
        },
      });
    }

    return tx.address.update({
      where: {
        id: addressId,
      },
      data,
    });
  });
};

export const setDefaultUserAddress = async (
  userId: string,
  addressId: string
): Promise<Address> => {
  return prisma.$transaction(async (tx) => {
    const existingAddress = await tx.address.findFirst({
      where: activeAddressWhere(userId, addressId),
    });

    if (!existingAddress) {
      throw new NotFoundError('Address not found');
    }

    await tx.address.updateMany({
      where: {
        userId,
        deletedAt: null,
      },
      data: {
        isDefault: false,
      },
    });

    return tx.address.update({
      where: {
        id: addressId,
      },
      data: {
        isDefault: true,
      },
    });
  });
};

export const softDeleteUserAddress = async (
  userId: string,
  addressId: string
): Promise<Address> => {
  return prisma.$transaction(async (tx) => {
    const existingAddress = await tx.address.findFirst({
      where: activeAddressWhere(userId, addressId),
    });

    if (!existingAddress) {
      throw new NotFoundError('Address not found');
    }

    const deletedAddress = await tx.address.update({
      where: {
        id: addressId,
      },
      data: {
        deletedAt: new Date(),
        isDefault: false,
      },
    });

    if (existingAddress.isDefault) {
      const fallbackAddress = await tx.address.findFirst({
        where: {
          userId,
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (fallbackAddress) {
        await tx.address.update({
          where: {
            id: fallbackAddress.id,
          },
          data: {
            isDefault: true,
          },
        });
      }
    }

    return deletedAddress;
  });
};
