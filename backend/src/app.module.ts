import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { typeormConfig } from './config/database.config';
import { RegistrationModule } from './modules/registration/registration.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(typeormConfig()),
    RegistrationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
