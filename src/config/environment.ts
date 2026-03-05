import dotenv from 'dotenv';
import { EnvironmentEnum } from '../utils/constants';
dotenv.config();

interface MailConfig {
  companyName: string;
  companyEmail: string;
  logoUrl: string;
  supportEmail: string;
  appUrl: string;
  resendApiKey: string;
}

interface Environment {
  port: number;
  env: EnvironmentEnum;
  databaseUrl: string;
  baseUrl: string;
  version: string;
  jwt: {
    secret: string;
    expiresInMinutes: number;
    refreshExpiresInDays: number;
    resetPasswordExpiresInHours: number;
  };
  logging: {
    level: string;
  };
  deliverooCloneAPIKey: string;
  serviceName: string;
  mail: MailConfig;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv<T extends string>(name: string, defaultValue: T): T {
  return (process.env[name] as T) || defaultValue;
}

const parsePositiveInt = (raw: string, name: string): number => {
  const value = Number(raw);
  if (Number.isNaN(value) || value <= 0) {
    throw new Error(`Invalid ${name} value: ${value}. Must be a positive integer.`);
  }
  return value;
};

export const environment: Environment = {
  port: parsePositiveInt(optionalEnv('PORT', '3000'), 'PORT'),
  env: optionalEnv<EnvironmentEnum>('NODE_ENV', EnvironmentEnum.Development),
  version: optionalEnv('APP_VERSION', '1.0.0'),
  databaseUrl: requireEnv('DATABASE_URL'),
  baseUrl: optionalEnv('BASE_URL', 'http://localhost:3000'),
  jwt: {
    secret: requireEnv('JWT_SECRET'),
    expiresInMinutes: parsePositiveInt(optionalEnv('JWT_EXPIRES_IN', '15'), 'JWT_EXPIRES_IN'),
    refreshExpiresInDays: parsePositiveInt(
      optionalEnv('JWT_REFRESH_EXPIRES_IN', '7'),
      'JWT_REFRESH_EXPIRES_IN'
    ),
    resetPasswordExpiresInHours: parsePositiveInt(
      optionalEnv('JWT_RESET_PASSWORD_EXPIRES_IN', '1'),
      'JWT_RESET_PASSWORD_EXPIRES_IN'
    ),
  },
  logging: {
    level: optionalEnv('LOG_LEVEL', 'info'),
  },
  deliverooCloneAPIKey: requireEnv('DELIVEROO_CLONE_API_KEY'),
  mail: {
    companyName: requireEnv('COMPANY_NAME'),
    companyEmail: requireEnv('COMPANY_EMAIL'),
    logoUrl: requireEnv('LOGO_URL'),
    supportEmail: requireEnv('SUPPORT_EMAIL'),
    appUrl: requireEnv('APP_URL'),
    resendApiKey: requireEnv('RESEND_API_KEY'),
  },
  serviceName: requireEnv('SERVICE_NAME'),
};
