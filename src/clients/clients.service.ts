import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientEntity } from 'src/clients/models/client.entity';
import { FindOneOptions, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

const saltOrRounds = 10;

export interface ClientCreateProps {
  access_id: string;
  access_secret: string;
}

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(ClientEntity)
    private clientRepository: Repository<ClientEntity>,
  ) {}

  /** find a client */
  async findOne(options: FindOneOptions<ClientEntity>) {
    return this.clientRepository.findOne(options);
  }

  /** create a client */
  async save(values: ClientCreateProps) {
    const hash = await bcrypt.hash(values.access_secret, saltOrRounds);

    const client = await this.clientRepository.findOne({
      where: {
        access_id: values.access_id,
      },
    });

    if (client) {
      throw new BadRequestException('Exist a client with same access id');
    }

    return await this.clientRepository.save({
      access_id: values.access_id,
      access_secret: hash,
    });
  }
}
