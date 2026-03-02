import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
  Img,
  Link,
} from '@react-email/components';
import React from 'react';

interface ResetPasswordEmailProps {
  resetUrl: string;
  companyName: string;
  supportEmail: string;
  logoUrl: string;
}

export const ResetPasswordEmail = ({
  resetUrl,
  companyName,
  supportEmail,
  logoUrl,
}: ResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your {companyName} password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img src={logoUrl} alt={companyName} style={logo} />
          </Section>

          <Section style={content}>
            <Text style={title}>Reset Your Password</Text>
            <Text style={message}>
              We received a request to reset your password. Click the button below to create a new
              password for your account.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={resetUrl}>
                Reset Password
              </Button>
            </Section>

            <Section style={linkFallback}>
              <Text style={linkFallbackText}>
                If the button doesn't work, copy and paste this link into your browser:
              </Text>
              <Link href={resetUrl} style={link}>
                {resetUrl}
              </Link>
            </Section>

            <Section style={warning}>
              <Text style={warningText}>
                <strong>Didn't request this?</strong>
                <br />
                If you didn't request a password reset, you can safely ignore this email. Your
                password will remain unchanged.
              </Text>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>This link expires in 1 hour for security reasons.</Text>
            <Text style={footerText}>
              Need help? Contact us at{' '}
              <Link href={`mailto:${supportEmail}`} style={link}>
                {supportEmail}
              </Link>
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} {companyName}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f6f6f6',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  lineHeight: '1.6',
};

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  overflow: 'hidden',
};

const header = {
  backgroundColor: '#00ccbc',
  padding: '30px 40px',
  textAlign: 'center' as const,
};

const logo = {
  maxWidth: '150px',
  height: 'auto',
};

const content = {
  padding: '40px',
};

const title = {
  fontSize: '24px',
  fontWeight: 600,
  color: '#2e3333',
  marginBottom: '20px',
  textAlign: 'center' as const,
};

const message = {
  fontSize: '16px',
  color: '#585c5c',
  marginBottom: '30px',
  textAlign: 'center' as const,
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#00ccbc',
  color: '#ffffff',
  textDecoration: 'none',
  padding: '16px 32px',
  borderRadius: '4px',
  fontSize: '16px',
  fontWeight: 600,
};

const linkFallback = {
  marginTop: '20px',
  padding: '20px',
  backgroundColor: '#f6f6f6',
  borderRadius: '4px',
};

const linkFallbackText = {
  fontSize: '14px',
  color: '#585c5c',
  marginBottom: '10px',
};

const link = {
  color: '#00ccbc',
  textDecoration: 'none',
  fontSize: '14px',
};

const warning = {
  marginTop: '30px',
  padding: '20px',
  backgroundColor: '#fff9f0',
  borderLeft: '4px solid #fabb00',
  borderRadius: '4px',
};

const warningText = {
  fontSize: '14px',
  color: '#585c5c',
};

const footer = {
  padding: '30px 40px',
  backgroundColor: '#f6f6f6',
  textAlign: 'center' as const,
  borderTop: '1px solid #e8ebeb',
};

const footerText = {
  fontSize: '14px',
  color: '#828585',
  marginBottom: '10px',
};

export default ResetPasswordEmail;
