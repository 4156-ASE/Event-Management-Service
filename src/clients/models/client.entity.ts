import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['access_id'])
export class ClientEntity {
  @PrimaryGeneratedColumn('uuid')
  cid: string;

  /** accessID for a firm customer */
  @Column()
  access_id: string;

  /** hashed access secret for a firm customer */
  @Column()
  access_secret: string;
}
