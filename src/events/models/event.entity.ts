import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClientEntity } from 'src/users/models/client.entity';

/**
 * Event entity which is used to store event information in database.
 */
@Entity()
export class EventEntity {
  /**
   * Event ID. Generated by database.
   */
  @PrimaryGeneratedColumn('uuid')
  eid: string;

  @ManyToOne(() => ClientEntity)
  @JoinColumn({ name: 'cid' })
  client: ClientEntity;

  /**
   * Event title. Required.
   */
  @Column()
  title: string;

  /**
   * Event description. Optional.
   */
  @Column({ nullable: true })
  desc: string;

  /**
   * Event start time. Required.
   */
  @Column('timestamp with time zone')
  start_time: Date;

  /**
   * Event end time. Required.
   */
  @Column('timestamp with time zone')
  end_time: Date;

  /**
   * Event location. Optional.
   */
  @Column({ nullable: true })
  location: string;

  // @Column({ nullable: true })
  // host: string;  // todo: change to user entity

  /**
   * Event host. Required.
   */
  @Column()
  host: string;

  /**
   * participants
   */
  @Column('simple-array')
  participants: string[];
}
