import z from 'zod';
import { emailSchema, passwordSchema } from './common.schema';

export const createUserRequestBodySchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: emailSchema,
  phone: z
    .string()
    .min(10, 'Phone number should be 10 digits')
    .max(10, 'Phone number cannot be more than 10 digits')
    .optional(),
  password: passwordSchema,
});

export const provisionRestaurantOwnerRequestBodySchema = createUserRequestBodySchema
  .pick({ firstName: true, lastName: true, email: true, password: true })
  .extend({
    restaurantId: z.string().trim().min(1, 'Restaurant id is required'),
  });

export const updateUserRequestBodySchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long').optional(),
  email: emailSchema.optional(),
  phone: z
    .string()
    .min(10, 'Phone number should be 10 digits')
    .max(10, 'Phone number cannot be more than 10 digits')
    .nullable()
    .optional(),
  password: passwordSchema.optional(),
});

export type UserUpdatePartiallyInput = z.infer<typeof updateUserRequestBodySchema>;

export const addressRequestBodySchema = z.object({
  label: z.string().min(1, 'Address label is required').max(50, 'Address label too long'),
  line1: z.string().min(1, 'Address line 1 is required').max(120, 'Address line 1 too long'),
  line2: z.string().max(120, 'Address line 2 too long').optional(),
  city: z.string().min(1, 'City is required').max(80, 'City too long'),
  postcode: z.string().min(1, 'Postcode is required').max(20, 'Postcode too long'),
  country: z.string().min(1, 'Country is required').max(80, 'Country too long').default('UK'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  instructions: z.string().max(250, 'Instructions too long').optional(),
  isDefault: z.boolean().optional(),
});

export const updateAddressRequestBodySchema = addressRequestBodySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'At least one address field is required');
