import { IsString } from 'class-validator';

/** Sign In DTO */
export class SignInDTO {
  @IsString()
  access_id: string;

  @IsString()
  access_secret: string;
}

/** Sign Up DTO */
export class SignUpDTO {
  @IsString()
  access_id: string;

  @IsString()
  access_secret: string;
}
