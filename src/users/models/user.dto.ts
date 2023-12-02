import { IsString, IsNotEmpty, IsEmail, IsEnum } from 'class-validator';

export class UpdateUserDTO {
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class RegisterUserDTO {
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(['admin', 'regular'])
  user_type: 'admin' | 'regular';
}
