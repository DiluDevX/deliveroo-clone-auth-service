import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildOwnerInvitationSubject } from '../src/emails/RestaurantInvitationEmail';
import { createRestaurantOwnerInvitationRequestBodySchema } from '../src/schema/user.schema';

const validInvitation = {
  firstName: 'Restaurant',
  lastName: 'Owner',
  email: ' owner@example.com ',
  restaurantId: 'restaurant-id',
  restaurantName: 'Test Kitchen',
  provisioningId: '123e4567-e89b-42d3-a456-426614174000',
};

describe('restaurant owner invitation validation', () => {
  it('normalizes email and keeps a valid restaurant name', () => {
    const parsed = createRestaurantOwnerInvitationRequestBodySchema.parse(validInvitation);

    assert.equal(parsed.email, 'owner@example.com');
    assert.equal(parsed.restaurantName, 'Test Kitchen');
    assert.equal(
      buildOwnerInvitationSubject(parsed.restaurantName),
      'Set up your owner account for Test Kitchen'
    );
  });

  it('rejects control characters in restaurant names used by email subjects', () => {
    const parsed = createRestaurantOwnerInvitationRequestBodySchema.safeParse({
      ...validInvitation,
      restaurantName: 'Test Kitchen\r\nBcc: attacker@example.com',
    });

    assert.equal(parsed.success, false);
  });
});
