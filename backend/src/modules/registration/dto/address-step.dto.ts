import { IsNotEmpty, IsString, Matches, IsOptional, IsEmail } from 'class-validator';

export class AddressStepDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{5}-?\d{3}$/, { message: 'Formato de CEP inválido' })
  zipCode: string;

  @IsNotEmpty()
  @IsString()
  street: string;

  @IsNotEmpty()
  @IsString()
  number: string;

  @IsOptional()
  @IsString()
  complement?: string;

  @IsNotEmpty()
  @IsString()
  neighborhood: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  state: string;
}
