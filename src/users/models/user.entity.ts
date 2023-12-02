import { Column, Entity, PrimaryColumn } from 'typeorm';
import { randomBytes } from 'crypto';

@Entity()
export class UserEntity {
  @PrimaryColumn()
  pid: string = randomBytes(16).toString('hex');

  @Column()
  cid: string;

  @Column({ unique: true })
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
