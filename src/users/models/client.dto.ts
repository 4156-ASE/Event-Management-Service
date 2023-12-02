import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateClientDTO {
  @IsString()
  @IsNotEmpty()
  client_token: string;

  @IsEmail()
  @IsNotEmpty()
  admin_email: string;
}

export class UpdateClientDTO {
  @IsString()
  client_token?: string;

  @IsEmail()
  admin_email?: string;
}
