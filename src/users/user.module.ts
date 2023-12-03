import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserController } from './user.controller';
import { UsersService } from './user.service';
import { UserEntity } from './models/user.entity';
import { ClientEntity } from './models/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, ClientEntity])],
  controllers: [UserController],
  providers: [UsersService],
})
export class UserModule {}
