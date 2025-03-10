import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
  return {
    secret: process.env.JWT_SECRET,
    apiSecret: process.env.API_SECRET,
    accessTokenTtl: parseInt(process.env.JWT_ACCESS_TOKEN_TTL ?? '2592000', 10),
    resetPasswordTokenTtl: parseInt(
      process.env.JWT_RESET_PASSWORD_TOKEN_TTL ?? '600',
      10,
    ),
    apiTokenTtl: parseInt(process.env.API_ACCESS_TOKEN_TTL ?? '31557600', 10),
  };
});
