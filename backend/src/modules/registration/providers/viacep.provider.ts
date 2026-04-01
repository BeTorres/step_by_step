import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ICepProvider } from './cep-provider.interface';

@Injectable()
export class ViaCepProvider implements ICepProvider {
  private readonly baseUrl = 'https://viacep.com.br/ws';

  async fetchAddressByCep(cep: string): Promise<{
    zipCode: string;
    street: string;
    neighborhood: string;
    city: string;
    state: string;
  }> {
    const cleanCep = cep.replace(/\D/g, '');

    try {
      const response = await axios.get(`${this.baseUrl}/${cleanCep}/json`);

      if (response.data.erro) {
        throw new Error('CEP not found');
      }

      return {
        zipCode: cep,
        street: response.data.logradouro,
        neighborhood: response.data.bairro,
        city: response.data.localidade,
        state: response.data.uf,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch address: ${message}`);
    }
  }
}
