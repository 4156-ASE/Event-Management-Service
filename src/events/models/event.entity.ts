import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class EventEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  title: string;

  @Column()
  desc: string;

  @Column()
  start_time: Date;

  @Column()
  end_time: Date;

  @Column()
  location: string;
}
