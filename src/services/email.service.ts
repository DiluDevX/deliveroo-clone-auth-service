import { Resend } from 'resend';
import { render } from '@react-email/components';
import { environment } from '../config/environment';
import { InternalServerError } from '../utils/errors';
import ResetPasswordEmail from '../emails/ResetPasswordEmail';
import RestaurantInvitationEmail from '../emails/RestaurantInvitationEmail';

const resend = new Resend(environment.mail.resendApiKey);

export const sendResetPasswordEmail = async (to: string, token: string) => {
  const resetUrl = `${environment.mail.appUrl}/account/reset-password?token=${encodeURIComponent(token)}`;

  const html = await render(
    ResetPasswordEmail({
      resetUrl,
      companyName: environment.mail.companyName,
      supportEmail: environment.mail.supportEmail,
      logoUrl: environment.mail.logoUrl,
    })
  );

  const { error } = await resend.emails.send({
    from: `${environment.mail.companyName} <${environment.mail.companyEmail}>`,
    to,
    subject: 'Reset your password',
    html,
  });

  if (error) {
    throw new InternalServerError('Failed to send reset password email');
  }
};

export const sendRestaurantInvitationEmail = async (
  to: string,
  token: string,
  role: string,
  restaurantName?: string
): Promise<void> => {
  const invitationUrl = `${environment.mail.appUrl}/account/restaurant-invitation?token=${encodeURIComponent(token)}`;
  const html = await render(
    RestaurantInvitationEmail({
      invitationUrl,
      role,
      restaurantName,
      companyName: environment.mail.companyName,
      supportEmail: environment.mail.supportEmail,
      logoUrl: environment.mail.logoUrl,
    })
  );

  const { error } = await resend.emails.send({
    from: `${environment.mail.companyName} <${environment.mail.companyEmail}>`,
    to,
    subject:
      role === 'super_admin'
        ? `Set up your owner account for ${restaurantName ?? 'your restaurant'}`
        : `You have been invited to join ${environment.mail.companyName}`,
    html,
  });

  if (error) {
    throw new InternalServerError('Failed to send restaurant invitation email');
  }
};
