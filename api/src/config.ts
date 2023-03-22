import * as dotenv from 'dotenv';

dotenv.config();

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  google: {
    bucketName: required('GOOGLE_BUCKET_NAME'),
    keyFilename: required('GOOGLE_KEY_FILENAME'),
    projectId: required('GOOGLE_PROJECT_ID')
  },
  port: process.env.PORT ? Number(process.env.PORT) : 8080,
  webUrl: required('WEB_URL')
};
