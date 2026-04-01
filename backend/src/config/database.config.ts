import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';

export const typeormConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'predictus',
  password: process.env.DATABASE_PASSWORD || 'password',
  database: process.env.DATABASE_NAME || 'predictus_db',
  entities: [path.join(__dirname, '../modules/**/*.entity{.ts,.js}')],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
});
