import { registerAs } from '@nestjs/config';

export default registerAs('appConfig', () => ({
  environment: process.env.NODE_ENV || 'production',
  minioBucketName: process.env.MINIO_PUBLIC_BUCKET_NAME,
  minioAccessKey: process.env.MINIO_ACCESS_KEY,
  minioSecretKey: process.env.MINIO_SECRET_KEY,
  minioEndpoint: process.env.MINIO_ENDPOINT,
}));
