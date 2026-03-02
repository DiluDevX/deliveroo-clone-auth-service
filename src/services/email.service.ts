import { Resend } from 'resend';
import { render } from '@react-email/components';
import { environment } from '../config/environment';
import { InternalServerError } from '../utils/errors';
import ResetPasswordEmail from '../emails/ResetPasswordEmail';

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
