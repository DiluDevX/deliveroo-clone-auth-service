import crypto from 'node:crypto';
import dayjs from 'dayjs';
import { RestaurantRole } from '@prisma/client';
import { environment } from '../config/environment';
import { isPrismaErrorWithCode } from '../config/database';
import { PRISMA_CODE } from '../utils/constants';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/errors';
import { hashToken } from '../utils/jwt';
import { comparePasswords, hashPassword } from '../utils/password';
import * as emailService from './email.service';
import * as restaurantOwnershipDatabaseService from './restaurant-ownership.database.service';
import * as restaurantTeamDatabaseService from './restaurant-team.database.service';
import * as usersDatabaseService from './users.database.service';

const grantableRolesByRole: Record<RestaurantRole, RestaurantRole[]> = {
  super_admin: ['admin', 'finance', 'employee'],
  admin: ['employee'],
  finance: [],
  employee: [],
};

const getManagerMembership = async (userId: string) => {
  const membership = await restaurantTeamDatabaseService.findActiveMembershipByUserId(userId);

  if (!membership) {
    throw new ForbiddenError('No active restaurant assignment was found');
  }

  if (grantableRolesByRole[membership.role].length === 0) {
    throw new ForbiddenError('Your restaurant role cannot manage team members');
  }

  return membership;
};

const assertCanGrantRole = (managerRole: RestaurantRole, role: RestaurantRole): void => {
  if (!grantableRolesByRole[managerRole].includes(role)) {
    throw new ForbiddenError(`Your restaurant role cannot assign the ${role} role`);
  }
};

const mapMember = (member: restaurantTeamDatabaseService.RestaurantTeamMemberRecord) => ({
  id: member.id,
  userId: member.userId,
  firstName: member.user.firstName,
  lastName: member.user.lastName,
  email: member.user.email,
  role: member.role,
  createdAt: member.createdAt,
});

export const getRestaurantTeam = async (userId: string) => {
  const manager = await getManagerMembership(userId);
  const [members, invitations] = await Promise.all([
    restaurantTeamDatabaseService.findRestaurantMembers(manager.restaurantId),
    restaurantTeamDatabaseService.findPendingInvitations(manager.restaurantId),
  ]);

  return {
    members: members.map(mapMember),
    invitations: invitations.map(({ id, email, role, expiresAt, createdAt }) => ({
      id,
      email,
      role,
      expiresAt,
      createdAt,
    })),
    grantableRoles: grantableRolesByRole[manager.role],
  };
};

export const createRestaurantInvitation = async (
  userId: string,
  input: { email: string; role: RestaurantRole }
) => {
  const manager = await getManagerMembership(userId);
  assertCanGrantRole(manager.role, input.role);

  const existingUser = await usersDatabaseService.findOneWithoutPassword({ email: input.email });
  if (existingUser?.role === 'platform_admin') {
    throw new ConflictError('Platform administrators cannot join restaurant teams');
  }

  if (existingUser) {
    const existingMembership = await restaurantTeamDatabaseService.findActiveMembershipByUserId(
      existingUser.id
    );
    if (existingMembership) {
      throw new ConflictError('This user already belongs to a restaurant');
    }
  }

  const existingInvitation = await restaurantTeamDatabaseService.findPendingInvitationByEmail(
    input.email
  );
  if (existingInvitation) {
    throw new ConflictError('A pending restaurant invitation already exists for this email');
  }

  const token = crypto.randomBytes(32).toString('hex');
  const invitation = await restaurantTeamDatabaseService.createInvitation({
    email: input.email,
    restaurantId: manager.restaurantId,
    role: input.role,
    tokenHash: hashToken(token),
    invitedById: userId,
    expiresAt: dayjs().add(environment.restaurantInvitationExpiresInDays, 'days').toDate(),
  });

  try {
    await emailService.sendRestaurantInvitationEmail(input.email, token, input.role);
  } catch (error) {
    await restaurantTeamDatabaseService.revokeInvitation(invitation.id);
    throw error;
  }

  return {
    id: invitation.id,
    email: invitation.email,
    role: invitation.role,
    expiresAt: invitation.expiresAt,
    createdAt: invitation.createdAt,
  };
};

export const updateRestaurantMemberRole = async (
  userId: string,
  membershipId: string,
  role: RestaurantRole
) => {
  const manager = await getManagerMembership(userId);
  assertCanGrantRole(manager.role, role);

  const member = await restaurantTeamDatabaseService.findActiveMembershipById(membershipId);
  if (!member || member.restaurantId !== manager.restaurantId) {
    throw new NotFoundError('Restaurant team member not found');
  }

  if (member.userId === userId) {
    throw new BadRequestError('You cannot change your own restaurant role');
  }

  if (member.role === 'super_admin') {
    throw new ForbiddenError(
      'The restaurant owner role can only change through ownership transfer'
    );
  }

  if (manager.role !== 'super_admin') {
    throw new ForbiddenError('Only the restaurant owner can change member roles');
  }

  return mapMember(await restaurantTeamDatabaseService.updateMemberRole(membershipId, role));
};

export const removeRestaurantMember = async (userId: string, membershipId: string) => {
  const manager = await getManagerMembership(userId);
  const member = await restaurantTeamDatabaseService.findActiveMembershipById(membershipId);

  if (!member || member.restaurantId !== manager.restaurantId) {
    throw new NotFoundError('Restaurant team member not found');
  }

  if (member.userId === userId) {
    throw new BadRequestError('You cannot remove yourself from the restaurant');
  }

  if (member.role === 'super_admin') {
    throw new ForbiddenError('The restaurant owner cannot be removed');
  }

  if (manager.role === 'admin' && member.role !== 'employee') {
    throw new ForbiddenError('Restaurant admins can only remove employees');
  }

  return mapMember(await restaurantTeamDatabaseService.softDeleteMember(membershipId));
};

export const cancelRestaurantInvitation = async (userId: string, invitationId: string) => {
  const manager = await getManagerMembership(userId);
  const invitations = await restaurantTeamDatabaseService.findPendingInvitations(
    manager.restaurantId
  );
  const invitation = invitations.find(({ id }) => id === invitationId);

  if (!invitation) {
    throw new NotFoundError('Pending restaurant invitation not found');
  }

  assertCanGrantRole(manager.role, invitation.role);
  await restaurantTeamDatabaseService.revokeInvitation(invitationId);
};

const getInvitationForAcceptance = async (token: string) => {
  const invitation = await restaurantTeamDatabaseService.findInvitationByTokenHashForAcceptance(
    hashToken(token)
  );
  if (!invitation) {
    throw new NotFoundError('Restaurant invitation is invalid or has expired');
  }
  return invitation;
};

export const getRestaurantInvitationPreview = async (token: string) => {
  const invitation = await getInvitationForAcceptance(token);
  const ownership = await restaurantOwnershipDatabaseService.findOwnershipByInvitationId(
    invitation.id
  );
  if (invitation.acceptedAt && !ownership) {
    throw new ConflictError('This restaurant invitation has already been used');
  }
  const existingUser = await usersDatabaseService.findOneWithoutPassword({
    email: invitation.email,
  });

  return {
    email: invitation.email,
    role: invitation.role,
    expiresAt: invitation.expiresAt,
    existingUser: Boolean(existingUser),
  };
};

export const acceptRestaurantInvitation = async (
  token: string,
  input: { firstName?: string; lastName?: string; password: string }
) => {
  const invitation = await getInvitationForAcceptance(token);
  const ownership = await restaurantOwnershipDatabaseService.findOwnershipByInvitationId(
    invitation.id
  );
  if (invitation.acceptedAt && !ownership) {
    throw new ConflictError('This restaurant invitation has already been used');
  }
  const existingUser = await usersDatabaseService.findOneWithPassword({ email: invitation.email });

  if (existingUser) {
    if (existingUser.role === 'platform_admin') {
      throw new ConflictError('Platform administrators cannot join restaurant teams');
    }

    if (!(await comparePasswords(input.password, existingUser.password))) {
      throw new UnauthorizedError('The account password is incorrect');
    }

    const existingMembership = await restaurantTeamDatabaseService.findActiveMembershipByUserId(
      existingUser.id
    );
    const isAcceptedOwnerRetry =
      ownership?.status === 'ACCEPTED' &&
      ownership.ownerUserId === existingUser.id &&
      existingMembership?.restaurantId === ownership.restaurantId &&
      existingMembership.role === 'super_admin';
    if (existingMembership && !isAcceptedOwnerRetry) {
      throw new ConflictError('This account already belongs to a restaurant');
    }
  } else if (!ownership && (!input.firstName || !input.lastName)) {
    throw new BadRequestError('First and last name are required for a new account');
  }

  let acceptanceResult;

  try {
    acceptanceResult = await restaurantTeamDatabaseService.acceptInvitation({
      invitationId: invitation.id,
      email: invitation.email,
      restaurantId: invitation.restaurantId,
      role: invitation.role,
      ownershipId: ownership?.id,
      existingUserId: existingUser?.id,
      newUser: existingUser
        ? undefined
        : {
            firstName: ownership?.ownerFirstName ?? input.firstName ?? '',
            lastName: ownership?.ownerLastName ?? input.lastName ?? '',
            password: await hashPassword(input.password),
          },
    });
  } catch (error) {
    if (isPrismaErrorWithCode(error, PRISMA_CODE.CONFLICT)) {
      throw new ConflictError('This account already belongs to a restaurant');
    }

    throw error;
  }

  if (!acceptanceResult) {
    throw new ConflictError('This restaurant invitation has already been used');
  }

  return {
    email: invitation.email,
    restaurantId: invitation.restaurantId,
    role: invitation.role,
    provisioningId: acceptanceResult.ownership?.provisioningId,
  };
};
