import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Registration } from './entities/registration.entity';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
import { ViaCepProvider } from './providers/viacep.provider';
import { ResendEmailProvider } from './providers/resend-email.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Registration])],
  controllers: [RegistrationController],
  providers: [
    RegistrationService,
    {
      provide: 'ICepProvider',
      useClass: ViaCepProvider,
    },
    {
      provide: 'IEmailProvider',
      useClass: ResendEmailProvider,
    },
  ],
})
export class RegistrationModule {}
