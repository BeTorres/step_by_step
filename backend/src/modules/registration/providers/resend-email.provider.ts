import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IEmailProvider } from './email-provider.interface';
import { Resend } from 'resend';

@Injectable()
export class ResendEmailProvider implements IEmailProvider, OnModuleInit {
  private resend: Resend;
  private apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('RESEND_API_KEY') || '';
  }

  onModuleInit() {
    if (!this.apiKey) {
        console.warn(
          'WARNING: RESEND_API_KEY is not set. Email functionality will not work.'
        );
        console.info(
          'Please set the RESEND_API_KEY environment variable. Get it from: https://resend.com'
        );
    } else {
      this.resend = new Resend(this.apiKey);
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    if (!this.resend) {
      throw new Error(
        'Resend email provider is not configured. Please set RESEND_API_KEY environment variable.'
      );
    }

    try {
      
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
      
      await this.resend.emails.send({
        from: fromEmail,
        to,
        subject,
        html,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to send email: ${message}`);
    }
  }
}
