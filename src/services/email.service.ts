import { Resend } from 'resend';
import { environment } from '../config/environment';
import { InternalServerError } from '../utils/errors';

const resend = new Resend(environment.mail.resendApiKey);

export const sendResetPasswordEmail = async (to: string, token: string) => {
  const resetUrl = `${environment.mail.appUrl}/account/reset-password?token=${encodeURIComponent(token)}`;

  const { error } = await resend.emails.send({
    from: `${environment.mail.companyName} <${environment.mail.companyEmail}>`,
    to,
    subject: 'Reset your password',
    html: `${resetUrl}`, // TODO: user a template
  });

  if (error) {
    throw new InternalServerError('Failed to send reset password email');
  }
};
