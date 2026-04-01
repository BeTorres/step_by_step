import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class IdentificationStepDto {
  @IsNotEmpty({ message: 'email não deve estar vazio' })
  @IsEmail({}, { message: 'email deve ser um endereço de email válido' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;
}
