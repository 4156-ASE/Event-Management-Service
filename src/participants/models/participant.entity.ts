import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EventEntity } from 'src/events/models/event.entity';
import { UserEntity } from 'src/users/models/user.entity';

@Entity()
export class ParticipantEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'pid' })
  user: UserEntity;

  @ManyToOne(() => EventEntity)
  @JoinColumn({ name: 'eid' })
  event: EventEntity;

  @Column({type: 'enum', enum: ['pending', 'accept', 'reject']})
  status: "pending" | "accept" | "reject";
}
