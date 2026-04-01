import axios, { AxiosInstance } from 'axios';
import { RegistrationData } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  async startRegistration(email: string): Promise<RegistrationData> {
    const normalizedEmail = this.normalizeEmail(email);
    const response = await this.client.post('/registration/start', { email: normalizedEmail });
    return response.data;
  }

  async completeIdentificationStep(email: string, name: string): Promise<RegistrationData> {
    const normalizedEmail = this.normalizeEmail(email);
    const response = await this.client.post('/registration/identification', 
      { name, email: normalizedEmail },
    );
    return response.data;
  }

  async completeDocumentStep(
    email: string,
    documentType: 'cpf' | 'cnpj',
    documentNumber: string,
  ): Promise<RegistrationData> {
    const normalizedEmail = this.normalizeEmail(email);
    const response = await this.client.post('/registration/document',
      { documentType, documentNumber, email: normalizedEmail }
    );
    return response.data;
  }

  async completeContactStep(email: string, phone: string): Promise<RegistrationData> {
    const normalizedEmail = this.normalizeEmail(email);
    const response = await this.client.post('/registration/contact',
      { phone, email: normalizedEmail }
    );
    return response.data;
  }

  async completeAddressStep(
    email: string,
    zipCode: string,
    street: string,
    number: string,
    neighborhood: string,
    city: string,
    state: string,
    complement?: string,
  ): Promise<RegistrationData> {
    const normalizedEmail = this.normalizeEmail(email);
    const response = await this.client.post('/registration/address',
      { zipCode, street, number, complement, neighborhood, city, state, email: normalizedEmail }
    );
    return response.data;
  }

  async completeRegistration(email: string): Promise<RegistrationData> {
    const normalizedEmail = this.normalizeEmail(email);
    const response = await this.client.post('/registration/complete', { email: normalizedEmail });
    return response.data;
  }

  async fetchAddressByCep(cep: string): Promise<{
    zipCode: string;
    street: string;
    neighborhood: string;
    city: string;
    state: string;
  }> {
    const cleanCep = cep.replace(/\D/g, '');

    
    if (cleanCep.length !== 8) {
      throw new Error('CEP deve ter 8 dígitos');
    }

    try {
      const url = `https://viacep.com.br/ws/${cleanCep}/json`;
      
      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.data.erro) {
        console.warn('CEP não encontrado:', cleanCep);
        throw new Error('CEP não encontrado');
      }

      const address = {
        zipCode: cep,
        street: response.data.logradouro || '',
        neighborhood: response.data.bairro || '',
        city: response.data.localidade || '',
        state: response.data.uf || '',
      };
      
      return address;
    } catch (error) {
      console.error('Erro em fetchAddressByCep:', error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Timeout ao buscar CEP');
        }
        throw new Error('Erro ao buscar CEP. Verifique sua conexão.');
      }
      throw error;
    }
  }

  async sendMfaCode(email: string): Promise<void> {
    const normalizedEmail = this.normalizeEmail(email);
    await this.client.post('/registration/send-mfa', { email: normalizedEmail });
  }

  async verifyMfaCode(email: string, code: string): Promise<{ verified: boolean }> {
    const normalizedEmail = this.normalizeEmail(email);
    const response = await this.client.post('/registration/verify-mfa',
      { code, email: normalizedEmail },
    );
    return response.data;
  }

  async getRegistration(email: string): Promise<RegistrationData> {
    const normalizedEmail = this.normalizeEmail(email);
    const response = await this.client.get(`/registration/${normalizedEmail}`);
    return response.data;
  }

  async restoreRegistrationFromEmail(email: string): Promise<RegistrationData | null> {
    try {
      const normalizedEmail = this.normalizeEmail(email);
      const registration = await this.getRegistration(email);
      return registration;
    } catch (error) {
      return null;
    }
  }

  async sendAbandonmentEmail(email: string): Promise<void> {
    const normalizedEmail = this.normalizeEmail(email);
    await this.client.post('/registration/send-abandonment-email', {
      email: normalizedEmail,
    });
  }
}

export const apiClient = new ApiClient();
