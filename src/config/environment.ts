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

function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

const parseEnvironmentEnum = (
  value: string | undefined,
  defaultValue: EnvironmentEnum
): EnvironmentEnum => {
  if (!value) return defaultValue;
  const validValues = Object.values(EnvironmentEnum);
  if (!validValues.includes(value as EnvironmentEnum)) {
    throw new Error(`Invalid NODE_ENV value: ${value}. Must be one of: ${validValues.join(', ')}`);
  }
  return value as EnvironmentEnum;
};

const parsePositiveInt = (raw: string, name: string): number => {
  const value = Number(raw);
  if (Number.isNaN(value) || value <= 0) {
    throw new Error(`Invalid ${name} value: ${value}. Must be a positive integer.`);
  }
  return value;
};

const loadMailConfig = (env: EnvironmentEnum): MailConfig => {
  const isProduction = env === EnvironmentEnum.Production;

  if (isProduction) {
    return {
      companyName: requireEnv('COMPANY_NAME'),
      companyEmail: requireEnv('COMPANY_EMAIL'),
      logoUrl: requireEnv('LOGO_URL'),
      supportEmail: requireEnv('SUPPORT_EMAIL'),
      appUrl: requireEnv('APP_URL'),
      resendApiKey: requireEnv('RESEND_API_KEY'),
    };
  }

  return {
    companyName: optionalEnv('COMPANY_NAME', 'Deliveroo Clone'),
    companyEmail: optionalEnv('COMPANY_EMAIL', 'noreply@deliveroo-clone.local'),
    logoUrl: optionalEnv('LOGO_URL', 'https://via.placeholder.com/150'),
    supportEmail: optionalEnv('SUPPORT_EMAIL', 'support@deliveroo-clone.local'),
    appUrl: optionalEnv('APP_URL', 'http://localhost:3000'),
    resendApiKey: optionalEnv('RESEND_API_KEY', 're_development_key'),
  };
};

const env = parseEnvironmentEnum(process.env['NODE_ENV'], EnvironmentEnum.Development);

export const environment: Environment = {
  port: parsePositiveInt(optionalEnv('PORT', '3000'), 'PORT'),
  env,
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
  mail: loadMailConfig(env),
  serviceName: requireEnv('SERVICE_NAME'),
};
