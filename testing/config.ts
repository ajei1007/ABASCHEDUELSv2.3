import * as dotenv from 'dotenv';
import * as path from 'path';

interface TestConfig {
  nodeEnv: 'beta' | 'production' | 'development';
  baseUrl: string;
  credentials: {
    email: string;
    password: string;
  };
  ci: boolean;
}

function getConfig(): TestConfig {
  // Load environment file based on NODE_ENV
  const nodeEnv = (process.env.NODE_ENV ?? 'beta') as TestConfig['nodeEnv'];
  const envFile = path.resolve(__dirname, `.env.${nodeEnv}`);
  
  // Only load if not already loaded
  if (!process.env.default_email && !process.env.default_password) {
    const result = dotenv.config({ path: envFile });
    if (result.error) {
      console.warn(`Could not load ${envFile}:`, result.error.message);
    }
  }

  const baseUrl = process.env.BASE_URL ?? 'https://beta.abaschedules.com';
  const email = process.env.default_email;
  const password = process.env.default_password;
  const ci = Boolean(process.env.CI);

  if (!email) {
    throw new Error('Environment variable "default_email" is required');
  }

  if (!password) {
    throw new Error('Environment variable "default_password" is required');
  }

  return {
    nodeEnv,
    baseUrl,
    credentials: {
      email,
      password,
    },
    ci,
  };
}

export const config = getConfig();