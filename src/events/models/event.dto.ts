import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsArray,
} from 'class-validator';

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
  @IsString()
  host: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional({ each: true })
  participants: string[];

  @IsOptional()
  @IsString()
  host_email: string;

  @IsOptional()
  @IsString()
  host_name: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional({ each: true })
  participants_email: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional({ each: true })
  participants_name: string[];
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

  participants: string[];

  /** client cid */
  cid: string;
}

export class EventUpdateReq {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  desc?: string;

  @IsDateString()
  @IsOptional()
  start_time?: string;

  @IsDateString()
  @IsOptional()
  end_time?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  host?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional({ each: true })
  participants?: string[];

  @IsOptional()
  @IsString()
  host_email: string;

  @IsOptional()
  @IsString()
  host_name: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional({ each: true })
  participants_email: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional({ each: true })
  participants_name: string[];
}
