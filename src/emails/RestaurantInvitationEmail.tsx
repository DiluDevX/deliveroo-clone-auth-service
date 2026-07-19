import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import React from 'react';

type RestaurantInvitationEmailProps = {
  invitationUrl: string;
  role: string;
  companyName: string;
  supportEmail: string;
  logoUrl: string;
};

const formatRole = (role: string): string =>
  role
    .split('_')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');

export const RestaurantInvitationEmail = ({
  invitationUrl,
  role,
  companyName,
  supportEmail,
  logoUrl,
}: RestaurantInvitationEmailProps) => (
  <Html>
    <Head />
    <Preview>You have been invited to join a restaurant team on {companyName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img src={logoUrl} alt={companyName} style={logo} />
        </Section>
        <Section style={content}>
          <Text style={title}>Join Your Restaurant Team</Text>
          <Text style={message}>
            You have been invited to join a restaurant on {companyName} as{' '}
            <strong>{formatRole(role)}</strong>.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={invitationUrl}>
              Accept Invitation
            </Button>
          </Section>
          <Text style={helperText}>
            If you already have an account, you will confirm your existing password. Otherwise, you
            can create your account after opening the invitation.
          </Text>
          <Text style={helperText}>
            If the button does not work, open{' '}
            <Link href={invitationUrl} style={link}>
              this invitation link
            </Link>
            .
          </Text>
        </Section>
        <Section style={footer}>
          <Text style={footerText}>This invitation expires for security reasons.</Text>
          <Text style={footerText}>
            Need help?{' '}
            <Link href={`mailto:${supportEmail}`} style={link}>
              {supportEmail}
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#f6f6f6',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  overflow: 'hidden',
};

const header = { backgroundColor: '#ffffff', padding: '30px 40px', textAlign: 'center' as const };
const logo = { maxWidth: '150px', height: 'auto', margin: '0 auto' };
const content = { padding: '40px' };
const title = { fontSize: '24px', fontWeight: 600, color: '#2e3333', textAlign: 'center' as const };
const message = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#585c5c',
  textAlign: 'center' as const,
};
const buttonContainer = { textAlign: 'center' as const, margin: '30px 0' };
const button = {
  backgroundColor: '#00ccbc',
  color: '#ffffff',
  textDecoration: 'none',
  padding: '16px 32px',
  borderRadius: '4px',
  fontSize: '16px',
  fontWeight: 600,
};
const helperText = { fontSize: '14px', lineHeight: '22px', color: '#585c5c' };
const link = { color: '#00a89b', textDecoration: 'none' };
const footer = {
  padding: '24px 40px',
  backgroundColor: '#f6f6f6',
  textAlign: 'center' as const,
  borderTop: '1px solid #e8ebeb',
};
const footerText = { fontSize: '13px', color: '#828585' };

export default RestaurantInvitationEmail;
