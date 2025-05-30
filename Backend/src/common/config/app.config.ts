import { registerAs } from '@nestjs/config';

export default registerAs('appConfig', () => ({
  environment: process.env.NODE_ENV || 'production',
  minioBucketName: process.env.MINIO_PUBLIC_BUCKET_NAME,
  minioAccessKey: process.env.MINIO_ACCESS_KEY,
  minioSecretKey: process.env.MINIO_SECRET_KEY,
  minioEndpoint: process.env.MINIO_ENDPOINT,
  mailHost: process.env.MAIL_HOST,
  smtpUsername: process.env.SMTP_USERNAME,
  smtpPassword: process.env.SMTP_PASSWORD,
  twitterBererToken: process.env.TWITTER_BEARER_TOKEN,
  baseUrl: process.env.BASE_URL,
  emailFrom: process.env.EMAIL_FROM,
}));
