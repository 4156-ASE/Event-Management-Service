import { IsNotEmpty, IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateEventDTO {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  desc: string;

  @IsNotEmpty()
  @IsDateString()
  start_time: Date;

  @IsNotEmpty()
  @IsDateString()
  end_time: Date;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  host: string;
}

export class UpdateEventDTO {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  desc: string;

  @IsNotEmpty()
  @IsDateString()
  start_time: Date;

  @IsNotEmpty()
  @IsDateString()
  end_time: Date;

  @IsNotEmpty()
  @IsString()
  location: string;
}
