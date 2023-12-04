import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEntity } from './models/event.entity';
import { EventInterface } from './models/event.interface';
import { CreateEventDTO, UpdateEventDTO } from './models/event.dto';
import { UserEntity } from 'src/users/models/user.entity';
import { ClientEntity } from 'src/users/models/client.entity';

/**
 * Event Service which will handle event relevent database operations, can be used by event controller.
 */
@Injectable()
export class EventsService {
  /**
   * Event constructor which will inject event repository.
   * @param eventRepository
   */
  constructor(
    @InjectRepository(EventEntity)
    private eventRepository: Repository<EventEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ClientEntity)
    private clientRepository: Repository<ClientEntity>,
  ) {}

  /**
   * Insert a event into database.
   * @param {CreateEventDTO} event The EventInterface object that need to be inserted into database.
   * @returns {Promise<EventInterface>} Return the content of the event object.
   */
  async insertEvent(headers, event: CreateEventDTO): Promise<EventInterface> {
    // check authorization of the header
    const clientToken = headers.authorization;
    if (!clientToken) {
      throw new HttpException(
        'No authorization token found',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const client = await this.clientRepository.findOne({
      where: { client_token: clientToken },
    });
    if (!client) {
      throw new HttpException('Client does not match', HttpStatus.UNAUTHORIZED);
    }

    // check if host exists
    const user = await this.userRepository.findOne({
      where: { pid: event.host, client: { cid: client.cid } },
    });

    if (!user) {
      throw new HttpException(
        'Host not found in user database',
        HttpStatus.NOT_FOUND,
      );
    }

    // create event entity
    const save_entity = {
      title: event.title,
      desc: event.desc,
      start_time: event.start_time,
      end_time: event.end_time,
      location: event.location,
      host: user,
      client: client,
    };

    const result = await this.eventRepository.save(save_entity);
    // console.log(result);
    return result;
  }

  /**
   * Get all the events of a client based on client token.
   * @returns {Promise<EventInterface[]>} The information of all the events from database.
   */
  async getEvents(headers): Promise<EventInterface[]> {
    // check authorization of the header
    const clientToken = headers.authorization;
    if (!clientToken) {
      throw new HttpException(
        'No authorization token found',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const client = await this.clientRepository.findOne({
      where: { client_token: clientToken },
    });
    if (!client) {
      throw new HttpException('Client does not match', HttpStatus.UNAUTHORIZED);
    }

    return await this.eventRepository.find({
      where: { client: { cid: client.cid } },
    });
  }

  /**
   * Get all the events of a user based on user ID.
   * @param {string} pid The user ID.
   * @returns {Promise<EventInterface[]>} The information of all the events from database.
   */
  async getEventsByUser(headers, pid: string): Promise<EventInterface[]> {
    // check authorization of the header
    const clientToken = headers.authorization;
    if (!clientToken) {
      throw new HttpException(
        'No authorization token found',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const client = await this.clientRepository.findOne({
      where: { client_token: clientToken },
    });
    if (!client) {
      throw new HttpException('Client does not match', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.userRepository.findOne({
      where: { pid: pid, client: { cid: client.cid } },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return await this.eventRepository.find({
      where: { host: { pid: pid }, client: { cid: client.cid } },
    });
  }

  /**
   * Get a event by eventID.
   * @param {string} eventID The event ID.
   * @returns {Promise<EventEntity>} The information of the target event from database.
   */
  async getEvent(headers, eventID: string): Promise<EventEntity> {
    const event = await this.eventRepository.findOne({
      where: {
        eid: eventID,
      },
    });
    if (!event) {
      throw new NotFoundException('Event Not Found.');
    }

    // check authorization of the header
    const clientToken = headers.authorization;
    if (!clientToken) {
      throw new HttpException(
        'No authorization token found',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const client = await this.clientRepository.findOne({
      where: { client_token: clientToken },
    });
    if (!client || client.cid !== event.client.cid) {
      throw new HttpException('Client does not match', HttpStatus.UNAUTHORIZED);
    }
    return event;
  }

  /**
   * Update a event by eventID.
   * @param {string} eventID The event ID.
   * @param {UpdateEventDTO} updatedEvent The information that need to be modified in an event.
   */
  async updateEvent(headers, eventID: string, updatedEvent: UpdateEventDTO) {
    // check authorization of the header
    const clientToken = headers.authorization;
    if (!clientToken) {
      throw new HttpException(
        'No authorization token found',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const client = await this.clientRepository.findOne({
      where: { client_token: clientToken },
    });
    if (!client) {
      throw new HttpException('Client does not match', HttpStatus.UNAUTHORIZED);
    }

    const event = await this.eventRepository.findOne({
      where: {
        eid: eventID,
        client: { cid: client.cid },
      },
    });
    if (!event) {
      throw new NotFoundException(`Event Not Found.`);
    }

    // const protectList = ['eid'];
    // protectList.forEach((key) => {
    //   if (key in updatedEvent) {
    //     delete updatedEvent[key];
    //   }
    // });
    await this.eventRepository.update({ eid: eventID }, updatedEvent);
  }

  /**
   * Delete a event by eventID.
   * @param {string} eventID The event ID.
   */
  async deleteEvent(headers, eventID: string): Promise<void> {
    // check authorization of the header
    const clientToken = headers.authorization;
    if (!clientToken) {
      throw new HttpException(
        'No authorization token found',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const client = await this.clientRepository.findOne({
      where: { client_token: clientToken },
    });
    if (!client) {
      throw new HttpException('Client does not match', HttpStatus.UNAUTHORIZED);
    }
    const event = await this.eventRepository.findOne({
      where: {
        eid: eventID,
      },
    });
    if (!event) {
      throw new NotFoundException(`Event Not Found.`);
    }
    if (event.client.cid !== client.cid) {
      throw new HttpException('Client does not match', HttpStatus.UNAUTHORIZED);
    }

    // TODO: @Haorui <hs3374@columbia.edu>
    const _result = await this.eventRepository.delete(eventID);
  }
}
