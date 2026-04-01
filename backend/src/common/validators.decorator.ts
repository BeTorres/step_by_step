import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isValidCPF, isValidCNPJ, isValidPhone } from './validators';

@ValidatorConstraint({ name: 'isValidCPF', async: false })
export class IsValidCPFConstraint implements ValidatorConstraintInterface {
  validate(cpf: string): boolean {
    return isValidCPF(cpf);
  }

  defaultMessage(): string {
    return 'CPF is invalid';
  }
}

@ValidatorConstraint({ name: 'isValidCNPJ', async: false })
export class IsValidCNPJConstraint implements ValidatorConstraintInterface {
  validate(cnpj: string): boolean {
    return isValidCNPJ(cnpj);
  }

  defaultMessage(): string {
    return 'CNPJ is invalid';
  }
}

@ValidatorConstraint({ name: 'isValidPhone', async: false })
export class IsValidPhoneConstraint implements ValidatorConstraintInterface {
  validate(phone: string): boolean {
    return isValidPhone(phone);
  }

  defaultMessage(): string {
    return 'Phone number is invalid';
  }
}

export function IsCPF(validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidCPFConstraint,
    });
  };
}

export function IsCNPJ(validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidCNPJConstraint,
    });
  };
}

export function IsPhoneNumber(validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPhoneConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'isValidConditionalDocument', async: false })
export class IsValidConditionalDocumentConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: any): boolean {
    const object = args.object as any;
    const { documentType, documentNumber } = object;
    
    if (!documentType || !documentNumber) return false;

    if (documentType === 'cpf') {
      return isValidCPF(documentNumber);
    } else if (documentType === 'cnpj') {
      return isValidCNPJ(documentNumber);
    }

    return false;
  }

  defaultMessage(args: any): string {
    const object = args.object as any;
    return `${object.documentType?.toUpperCase() || 'Document'} inválido`;
  }
}

export function IsValidDocument(validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidConditionalDocumentConstraint,
    });
  };
}
