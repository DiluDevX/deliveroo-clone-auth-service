import { z } from 'zod';
import { emailSchema, passwordSchema } from './common.schema';

export const assignableRestaurantRoleSchema = z.enum(['employee', 'admin', 'finance']);

export const createRestaurantInvitationRequestBodySchema = z.object({
  email: emailSchema.transform((email) => email.trim().toLowerCase()),
  role: assignableRestaurantRoleSchema,
});

export const updateRestaurantMemberRoleRequestBodySchema = z.object({
  role: assignableRestaurantRoleSchema,
});

export const restaurantTeamResourcePathParamsSchema = z.object({
  id: z.string().uuid('Invalid resource ID'),
});

export const restaurantInvitationTokenPathParamsSchema = z.object({
  token: z.string().min(32, 'Invalid invitation token').max(200, 'Invalid invitation token'),
});

export const acceptRestaurantInvitationRequestBodySchema = z.object({
  firstName: z.string().trim().min(1).max(50).optional(),
  lastName: z.string().trim().min(1).max(50).optional(),
  password: passwordSchema,
});
