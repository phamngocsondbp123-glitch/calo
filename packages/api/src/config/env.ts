import dotenv from 'dotenv';

dotenv.config();

const splitCsv = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);

export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  corsOrigins: splitCsv(process.env.CORS_ORIGIN ?? 'http://localhost:5173,http://localhost:5174'),
  uploadDir: process.env.UPLOAD_DIR ?? 'uploads',
  demoMode: process.env.CALO_DEMO_MODE !== 'false'
};
