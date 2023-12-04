import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class EventCreateReq {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  desc: string;

  @IsNotEmpty()
  @IsDateString()
  start_time: string;

  @IsNotEmpty()
  @IsDateString()
  end_time: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  host: string;
}

/** Event detail for backend */
export class EventDetail {
  id: string;

  title: string;

  desc: string;

  start_time: string;

  end_time: string;

  location: string;

  host: string;

  /** client cid */
  cid: string;
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
