import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { IsPhoneNumber } from '../../../common/validators.decorator';

export class ContactStepDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber({ message: 'Número de telefone inválido' })
  phone: string;
}
