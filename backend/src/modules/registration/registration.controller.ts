import { Controller, Post, Body, Get, Param, BadRequestException, Query } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { IdentificationStepDto } from './dto/identification-step.dto';
import { DocumentStepDto } from './dto/document-step.dto';
import { ContactStepDto } from './dto/contact-step.dto';
import { AddressStepDto } from './dto/address-step.dto';
import { VerifyMfaDto } from './dto/verify-mfa.dto';

@Controller('api/registration')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post('start')
  async startRegistration(@Body() dto: { email: string }) {
    if (!dto.email) {
      throw new BadRequestException('Email é obrigatório');
    }
    return this.registrationService.startRegistration(dto.email);
  }

  @Post('identification')
  async completeIdentificationStep(
    @Body() body: IdentificationStepDto,
  ) {
    return this.registrationService.completeIdentificationStep(body);
  }

  @Post('document')
  async completeDocumentStep(
    @Body() body: DocumentStepDto,
  ) {
    return this.registrationService.completeDocumentStep(body);
  }

  @Post('contact')
  async completeContactStep(
    @Body() body: ContactStepDto,
  ) {
    return this.registrationService.completeContactStep(body);
  }

  @Post('address')
  async completeAddressStep(
    @Body() body: AddressStepDto,
  ) {
    return this.registrationService.completeAddressStep(body);
  }

  @Post('complete')
  async completeRegistration(@Body() body: { email: string }) {
    return this.registrationService.completeRegistration(body.email);
  }

  @Post('send-mfa')
  async sendMfaCode(@Body() body: { email: string }) {
    if (!body.email) {
      throw new BadRequestException('Email é obrigatório');
    }
    await this.registrationService.sendMfaCode(body.email);
    return { message: 'Código MFA enviado' };
  }

  @Post('verify-mfa')
  async verifyMfaCode(
    @Body() body: VerifyMfaDto,
  ) {
    const result = await this.registrationService.verifyMfaCode(body);
    return { verified: result };
  }

  @Get(':email')
  async getRegistration(@Param('email') email: string) {
    return this.registrationService.getRegistrationData(email);
  }

  @Post('send-abandonment-email')
  async sendAbandonmentEmail(@Body() body: { email: string }) {
    if (!body.email) {
      throw new BadRequestException('Email é obrigatório');
    }
    await this.registrationService.sendAbandonmentEmail(body.email);
    return { message: 'Email de reengagement enviado' };
  }

  @Post('send-reengagement-emails')
  async sendReEngagementEmails(@Query('hoursInactive') hoursInactive?: string) {
    const hours = hoursInactive ? parseInt(hoursInactive, 10) : 24;
    const count = await this.registrationService.sendReEngagementemails(hours);
    return { message: `Re-engagement emails sent to ${count} users` };
  }
}
