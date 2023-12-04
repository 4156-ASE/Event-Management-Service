import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ClientEntity {
  @PrimaryGeneratedColumn()
  cid: string;

  /** accessID for a firm customer */
  @Column({ unique: true })
  access_id: string;

  /** hashed access secret for a firm customer */
  @Column()
  access_secret: string;
}
