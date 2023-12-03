import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { randomBytes } from 'crypto';
import { ClientEntity } from './client.entity';

@Entity()
export class UserEntity {
  @PrimaryColumn()
  pid: string = randomBytes(16).toString('hex');

  @ManyToOne(() => ClientEntity)
  @JoinColumn({ name: 'cid' })
  client: ClientEntity;

  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'regular'],
  })
  user_type: 'admin' | 'regular';

  @Column()
  first_name: string;

  @Column()
  last_name: string;
}
