export enum RegistrationStatus {
  PENDING = 'pending',
  IDENTIFICATION_STEP = 'identification',
  DOCUMENT_STEP = 'document',
  CONTACT_STEP = 'contact',
  ADDRESS_STEP = 'address',
  REVIEW_STEP = 'review',
  COMPLETED = 'completed',
}

export interface RegistrationData {
  id: string;
  email: string;
  name?: string;
  documentType?: 'cpf' | 'cnpj';
  documentNumber?: string;
  phone?: string;
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  status: RegistrationStatus;
  mfaCode?: string;
  mfaCodeExpiresAt?: string;
  mfaCodeVerified: boolean;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
