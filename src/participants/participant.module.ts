import { Module } from '@nestjs/common';
import { ParticipantsController } from './participant.controller';
import { ParticipantsService } from './participant.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipantEntity } from './models/participant.entity';
import { UserEntity } from 'src/users/models/user.entity';
import { EventEntity } from 'src/events/models/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ParticipantEntity, UserEntity, EventEntity])],
  controllers: [ParticipantsController],
  providers: [ParticipantsService],
})
export class ParticipantsModule {}