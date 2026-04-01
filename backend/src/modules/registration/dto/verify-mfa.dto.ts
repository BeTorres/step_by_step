import { IsNotEmpty, IsEmail } from 'class-validator';

export class VerifyMfaDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  code: string;
}
