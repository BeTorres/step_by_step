import { isValidCPF, isValidCNPJ, isValidPhone, formatCPF, formatCNPJ, formatPhone, formatCEP } from '@/lib/validators';

export const validationRules = {
  email: {
    validate: (value: string): boolean => {
      if (!value) return false;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    },
    message: 'email deve ser um endereço de email válido',
    emptyMessage: 'email não deve estar vazio',
  },
  name: {
    validate: (value: string): boolean => value.length >= 3,
    message: 'Nome deve ter pelo menos 3 caracteres',
  },
  phone: {
    validate: (value: string): boolean => isValidPhone(value),
    message: 'Por favor, digite um número de telefone brasileiro válido com 11 dígitos (com código de área)',
    format: formatPhone,
  },
  cpf: {
    validate: (value: string): boolean => isValidCPF(value),
    message: 'Por favor, digite um número de CPF válido',
    format: formatCPF,
  },
  cnpj: {
    validate: (value: string): boolean => isValidCNPJ(value),
    message: 'Por favor, digite um número de CNPJ válido',
    format: formatCNPJ,
  },
  cep: {
    validate: (value: string): boolean => /^\d{5}-?\d{3}$/.test(value.replace(/\D/g, '')),
    message: 'Por favor, digite um CEP válido (formato: XXXXX-XXX)',
    format: formatCEP,
  },
  zipCode: {
    validate: (value: string): boolean => /^\d{5}-?\d{3}$/.test(value.replace(/\D/g, '')),
    message: 'Formato de CEP inválido',
  },
  street: {
    validate: (value: string): boolean => value.length >= 3,
    message: 'Rua deve ter pelo menos 3 caracteres',
  },
  number: {
    validate: (value: string): boolean => /^\d+[a-zA-Z]*$/.test(value),
    message: 'Número deve ser numérico',
  },
  neighborhood: {
    validate: (value: string): boolean => value.length >= 2,
    message: 'Bairro deve ter pelo menos 2 caracteres',
  },
  city: {
    validate: (value: string): boolean => value.length >= 2,
    message: 'Cidade deve ter pelo menos 2 caracteres',
  },
  state: {
    validate: (value: string): boolean => /^[A-Z]{2}$/.test(value),
    message: 'Estado deve ter 2 letras maiúsculas',
  },
};

export function validateField(fieldName: string, value: string): { valid: boolean; message?: string } {
  const rule = validationRules[fieldName as keyof typeof validationRules];

  if (!rule) {
    return { valid: true };
  }

  if (!value && fieldName !== 'complement') {
    const errorMessage = (rule as any).emptyMessage || `${fieldName} é obrigatório`;
    return { valid: false, message: errorMessage };
  }

  const isValid = rule.validate(value);

  return {
    valid: isValid,
    message: isValid ? undefined : rule.message,
  };
}

export function formatFieldValue(fieldName: string, value: string): string {
  const rule = validationRules[fieldName as keyof typeof validationRules];

  if (rule && 'format' in rule) {
    return (rule as any).format(value);
  }

  return value;
}
