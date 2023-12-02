import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ClientEntity {
  @PrimaryGeneratedColumn()
  cid: string;

  @Column()
  client_token: string;

  @Column()
  admin_email: string;
}
