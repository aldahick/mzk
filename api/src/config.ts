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
    credentialsPath: required('GOOGLE_CREDENTIALS_PATH'),
    projectId: required('GOOGLE_PROJECT_ID'),
    useCloudRun: !!process.env.GOOGLE_CLOUD_RUN?.length && process.env.GOOGLE_CLOUD_RUN !== "false"
  },
  omnizart: {
    runnerPath: process.env.OMNIZART_RUNNER_PATH
  },
  port: process.env.PORT ? Number(process.env.PORT) : 8080,
  webUrl: required('WEB_URL')
};
