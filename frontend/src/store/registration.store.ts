import { create } from 'zustand';
import { RegistrationData, RegistrationStatus } from '@/types';

interface RegistrationStore {
  email: string;
  name: string;
  documentType: 'cpf' | 'cnpj';
  documentNumber: string;
  phone: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  registration: RegistrationData | null;
  currentStep: RegistrationStatus;
  isLoading: boolean;
  error: string | null;
  
  setEmail: (email: string) => void;
  setName: (name: string) => void;
  setDocumentType: (type: 'cpf' | 'cnpj') => void;
  setDocumentNumber: (number: string) => void;
  setPhone: (phone: string) => void;
  setZipCode: (zipCode: string) => void;
  setStreet: (street: string) => void;
  setNumber: (number: string) => void;
  setComplement: (complement: string) => void;
  setNeighborhood: (neighborhood: string) => void;
  setCity: (city: string) => void;
  setState: (state: string) => void;
  setRegistration: (registration: RegistrationData) => void;
  setCurrentStep: (step: RegistrationStatus) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  restoreFromRegistration: (registration: RegistrationData) => void;
}

export const useRegistrationStore = create<RegistrationStore>((set) => ({
  email: '',
  name: '',
  documentType: 'cpf',
  documentNumber: '',
  phone: '',
  zipCode: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  registration: null,
  currentStep: RegistrationStatus.PENDING,
  isLoading: false,
  error: null,
  
  setEmail: (email: string) => set({ email }),
  setName: (name: string) => set({ name }),
  setDocumentType: (documentType: 'cpf' | 'cnpj') => set({ documentType }),
  setDocumentNumber: (documentNumber: string) => set({ documentNumber }),
  setPhone: (phone: string) => set({ phone }),
  setZipCode: (zipCode: string) => set({ zipCode }),
  setStreet: (street: string) => set({ street }),
  setNumber: (number: string) => set({ number }),
  setComplement: (complement: string) => set({ complement }),
  setNeighborhood: (neighborhood: string) => set({ neighborhood }),
  setCity: (city: string) => set({ city }),
  setState: (state: string) => set({ state }),
  setRegistration: (registration: RegistrationData) => set({ registration }),
  setCurrentStep: (step: RegistrationStatus) => set({ currentStep: step }),
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  reset: () => set({
    email: '',
    name: '',
    documentType: 'cpf',
    documentNumber: '',
    phone: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    registration: null,
    currentStep: RegistrationStatus.PENDING,
    isLoading: false,
    error: null,
  }),
  restoreFromRegistration: (registration: RegistrationData) => set({
    email: registration.email,
    name: registration.name || '',
    documentType: (registration.documentType as 'cpf' | 'cnpj') || 'cpf',
    documentNumber: registration.documentNumber || '',
    phone: registration.phone || '',
    zipCode: registration.zipCode || '',
    street: registration.street || '',
    number: registration.number || '',
    complement: registration.complement || '',
    neighborhood: registration.neighborhood || '',
    city: registration.city || '',
    state: registration.state || '',
    registration,
    currentStep: registration.status,
  }),
}));
