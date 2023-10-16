import { Module } from '@nestjs/common';
import { ParticipantsController } from './participant.controller';
import { ParticipantsService } from './participant.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipantEntity } from './models/participant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ParticipantEntity])],
  controllers: [ParticipantsController],
  providers: [ParticipantsService],
})
export class ParticipantsModule {}
