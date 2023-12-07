import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientEntity } from 'src/clients/models/client.entity';

/**
 * Event module which contains EventsController and EventsService.
 */
@Module({
  imports: [TypeOrmModule.forFeature([ClientEntity])],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
