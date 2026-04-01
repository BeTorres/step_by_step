export interface ICepProvider {
  fetchAddressByCep(cep: string): Promise<{
    zipCode: string;
    street: string;
    neighborhood: string;
    city: string;
    state: string;
  }>;
}
