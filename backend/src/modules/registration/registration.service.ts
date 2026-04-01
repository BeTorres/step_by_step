import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Registration, RegistrationStatus } from './entities/registration.entity';
import { IdentificationStepDto } from './dto/identification-step.dto';
import { DocumentStepDto } from './dto/document-step.dto';
import { ContactStepDto } from './dto/contact-step.dto';
import { AddressStepDto } from './dto/address-step.dto';
import { VerifyMfaDto } from './dto/verify-mfa.dto';
import { ICepProvider } from './providers/cep-provider.interface';
import { IEmailProvider } from './providers/email-provider.interface';

@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(Registration)
    private registrationRepository: Repository<Registration>,
    @Inject('ICepProvider')
    private cepProvider: ICepProvider,
    @Inject('IEmailProvider')
    private emailProvider: IEmailProvider,
  ) {}

  async startRegistration(email: string): Promise<Registration> {
    const normalizedEmail = email.trim().toLowerCase();
    let registration = await this.registrationRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (!registration) {
      registration = this.registrationRepository.create({
        email: normalizedEmail,
        status: RegistrationStatus.PENDING,
        startedAt: new Date(),
      });
    }

    return this.registrationRepository.save(registration);
  }

  async completeIdentificationStep(body: IdentificationStepDto): Promise<Registration> {
    const normalizedEmail = body.email.trim().toLowerCase();
    let registration = await this.registrationRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (!registration) {
      registration = this.registrationRepository.create({
        email: normalizedEmail,
        status: RegistrationStatus.PENDING,
        startedAt: new Date(),
      });
    }

    registration.email = normalizedEmail;
    registration.name = body.name;
    registration.status = RegistrationStatus.IDENTIFICATION_STEP;
    registration.updatedAt = new Date();

    return this.registrationRepository.save(registration);
  }

  async completeDocumentStep(body: DocumentStepDto): Promise<Registration> {
    const normalizedEmail = body.email.trim().toLowerCase();
    const registration = await this.getRegistration(normalizedEmail);

    if (registration.status === RegistrationStatus.PENDING) {
      throw new BadRequestException('Must complete identification step first');
    }

    registration.documentType = body.documentType;
    registration.documentNumber = body.documentNumber;
    registration.status = RegistrationStatus.DOCUMENT_STEP;
    registration.updatedAt = new Date();

    const saved = await this.registrationRepository.save(registration);

    return saved;
  }

  async completeContactStep(body: ContactStepDto): Promise<Registration> {
    const normalizedEmail = body.email.trim().toLowerCase();
    const registration = await this.getRegistration(normalizedEmail);

    const allStatuses = Object.entries(RegistrationStatus);
    if (
      registration.status === RegistrationStatus.PENDING ||
      registration.status === RegistrationStatus.IDENTIFICATION_STEP
    ) {
      console.error('Contact step validation failed:', {
        email: normalizedEmail,
        registrationEmail: registration.email,
        status: registration.status,
        expectedStatuses: [
          RegistrationStatus.DOCUMENT_STEP,
          RegistrationStatus.CONTACT_STEP,
          RegistrationStatus.ADDRESS_STEP,
        ],
      });
      throw new BadRequestException('Must complete document step first');
    }

    registration.phone = body.phone;
    registration.status = RegistrationStatus.CONTACT_STEP;
    registration.updatedAt = new Date();

    const saved = await this.registrationRepository.save(registration);
   
    return saved;
  }

  async completeAddressStep(body: AddressStepDto): Promise<Registration> {
    const normalizedEmail = body.email.trim().toLowerCase();
    const registration = await this.getRegistration(normalizedEmail);

    if (
      registration.status === RegistrationStatus.PENDING ||
      registration.status === RegistrationStatus.IDENTIFICATION_STEP ||
      registration.status === RegistrationStatus.DOCUMENT_STEP
    ) {
      throw new BadRequestException('Must complete contact step first');
    }

    const addressData = await this.cepProvider.fetchAddressByCep(body.zipCode);

    registration.zipCode = addressData.zipCode;
    registration.street = body.street || addressData.street;
    registration.number = body.number;
    registration.complement = body.complement || null;
    registration.neighborhood = body.neighborhood || addressData.neighborhood;
    registration.city = body.city || addressData.city;
    registration.state = body.state || addressData.state;
    registration.status = RegistrationStatus.ADDRESS_STEP;
    registration.updatedAt = new Date();

    const saved = await this.registrationRepository.save(registration);

    await this.sendMfaCode(normalizedEmail);

    return saved;
  }

  async completeRegistration(email: string): Promise<Registration> {
    const normalizedEmail = email.trim().toLowerCase();
    const registration = await this.getRegistration(normalizedEmail);

    if (
      registration.status !== RegistrationStatus.ADDRESS_STEP &&
      registration.status !== RegistrationStatus.COMPLETED
    ) {
      throw new BadRequestException('Must complete all steps before finishing registration');
    }

    if (registration.status === RegistrationStatus.COMPLETED) {
      return registration;
    }

    registration.status = RegistrationStatus.COMPLETED;
    registration.completedAt = new Date();
    registration.updatedAt = new Date();

    const saved = await this.registrationRepository.save(registration);
    try {
      await this.sendSuccessEmail(registration.email, registration.name || 'User');
    } catch (emailError) {
      console.error('Erro ao enviar email, mas registro foi completado:', {
        email: registration.email,
        error: emailError instanceof Error ? emailError.message : String(emailError),
      });

    }

    return saved;
  }

  async sendMfaCode(email: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    const registration = await this.getRegistration(normalizedEmail);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    registration.mfaCode = code;
    registration.mfaCodeExpiresAt = expiresAt;
    registration.mfaCodeVerified = false;

    await this.registrationRepository.save(registration);

    await this.emailProvider.sendEmail(
      normalizedEmail,
      'Seu Codigo de Verificação',
      this.getMfaEmailTemplate(code),
    );

  }

  async sendAbandonmentEmail(email: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    
    try {
      const registration = await this.getRegistration(normalizedEmail);

      if (registration.status === RegistrationStatus.COMPLETED) {
        return;
      }

      const stepNumber = this.getStepNumber(registration.status);

      await this.emailProvider.sendEmail(
        normalizedEmail,
        'Volte a completar sua inscrição',
        this.getReEngagementEmailTemplate(
          registration.name || 'Usuário',
          stepNumber,
          normalizedEmail,
        ),
      );
    } catch (error) {
      console.error('Failed to send abandonment email:', error);
      throw error;
    }
  }

  async verifyMfaCode(body: VerifyMfaDto): Promise<boolean> {
    const normalizedEmail = body.email.trim().toLowerCase();
    const registration = await this.getRegistration(normalizedEmail);

    if (!registration.mfaCode || registration.mfaCodeVerified) {
      throw new BadRequestException('No valid MFA code found');
    }

    if (!registration.mfaCodeExpiresAt || new Date() > registration.mfaCodeExpiresAt) {
      throw new BadRequestException('MFA code has expired');
    }

    if (registration.mfaCode !== body.code) {
      throw new BadRequestException('Invalid MFA code');
    }

    registration.mfaCodeVerified = true;
    await this.registrationRepository.save(registration);

    return true;
  }

  async getRegistration(email: string): Promise<Registration> {
    const normalizedEmail = email.trim().toLowerCase();

    const registration = await this.registrationRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (!registration) {
      console.error('Registration not found for email:', normalizedEmail);
      throw new NotFoundException('Registration not found');
    }

    return registration;
  }

  async getRegistrationData(email: string): Promise<Registration> {
    const normalizedEmail = email.trim().toLowerCase();
    return this.getRegistration(normalizedEmail);
  }

  private async sendSuccessEmail(email: string, name: string): Promise<void> {
    try {
      await this.emailProvider.sendEmail(
        email,
        'Registro Concluído com Sucesso',
        this.getSuccessEmailTemplate(name),
      );
    } catch (error) {
      console.error('Erro ao enviar email de sucesso:', {
        email,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  private getMfaEmailTemplate(code: string): string {
    return `
      <h2>Seu Código de Verificação</h2>
      <p>Seu código de verificação é: <strong style="font-size: 24px; letter-spacing: 4px;">${code}</strong></p>
      <p>Este código expira em <strong>15 minutos</strong>.</p>
      <br />
      <p style="color: #666; font-size: 14px;">
        Se você não solicitou este código, ignore este email.
      </p>
      <hr />
      <p style="font-size: 12px; color: #666;">
        Este é um email automático. Por favor, não responda.
      </p>
    `;
  }

  private getSuccessEmailTemplate(name: string): string {
    return `
      <h2>Welcome, ${name}!</h2>
      <p>Your registration has been completed successfully.</p>
      <p>You can now access all features of our platform.</p>
    `;
  }

  async sendReEngagementemails(hoursInactive: number = 24): Promise<number> {
    const cutoffTime = new Date(Date.now() - hoursInactive * 60 * 60 * 1000);

    const abandonedRegistrations = await this.registrationRepository
      .createQueryBuilder('registration')
      .where('registration.status != :completed', { completed: RegistrationStatus.COMPLETED })
      .andWhere('registration.updatedAt < :cutoffTime', { cutoffTime })
      .getMany();

    let sentCount = 0;

    for (const registration of abandonedRegistrations) {
      try {
        const stepNumber = this.getStepNumber(registration.status);

        await this.emailProvider.sendEmail(
          registration.email,
          'Complete a sua inscrição',
          this.getReEngagementEmailTemplate(registration.name || 'Usuário', stepNumber, registration.email),
        );

        sentCount++;
      } catch (error) {
        console.error(`Failed to send re-engagement email to ${registration.email}:`, error);
      }
    }

    return sentCount;
  }

  private getStepNumber(status: RegistrationStatus): number {
    const stepMap: Record<RegistrationStatus, number> = {
      [RegistrationStatus.PENDING]: 1,
      [RegistrationStatus.IDENTIFICATION_STEP]: 2,
      [RegistrationStatus.DOCUMENT_STEP]: 3,
      [RegistrationStatus.CONTACT_STEP]: 4,
      [RegistrationStatus.ADDRESS_STEP]: 5,
      [RegistrationStatus.REVIEW_STEP]: 5,
      [RegistrationStatus.COMPLETED]: 0,
    };
    return stepMap[status] || 0;
  }

  private getReEngagementEmailTemplate(name: string, nextStep: number, email: string): string {
    const stepNames = [
      'Informação',
      'Identificação',
      'Documento',
      'Contato',
      'Endereço',
    ];
    const stepName = stepNames[nextStep - 1] || 'Inscrição';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resumeUrl = `${frontendUrl}?email=${encodeURIComponent(email)}`;

    return `
      <h2>Complete a sua Inscrição, ${name}!</h2>
      <p>Percebemos que você começou o processo de registro, mas não terminou.</p>
      <p>Você estava na etapa ${nextStep} (<strong>${stepName}</strong>). Leva apenas alguns minutos para completar!</p>
      <br />
      <p>
        <a href="${resumeUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Continuar Inscrição
        </a>
      </p>
      <br />
      <p>Se tiver dúvidas, entre em contato conosco:</p>
      <p>Email: suporte@predictus.com.br</p>
      <hr />
      <p style="font-size: 12px; color: #666;">
        Este é um email automático. Por favor, não responda.
      </p>
    `;
  }
}
