import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { IsValidDocument } from '../../../common/validators.decorator';

export class DocumentStepDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  documentType: 'cpf' | 'cnpj';

  @IsNotEmpty()
  @IsString()
  @IsValidDocument({ message: 'Documento inválido' })
  documentNumber: string;
}
