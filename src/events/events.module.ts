import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from './models/event.entity';
import { UserEntity } from 'src/users/models/user.entity';

/**
 * Event module which contains EventsController and EventsService.
 */
@Module({
  imports: [TypeOrmModule.forFeature([EventEntity, UserEntity])],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
