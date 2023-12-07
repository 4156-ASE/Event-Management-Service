import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { EventEntity } from './models/event.entity';
import {
  EventCreateReq,
  EventDetail,
  EventUpdateReq,
} from './models/event.dto';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

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
  ) {}

  eventEntity2EventDetail(cid: string, event: EventEntity): EventDetail {
    return {
      id: event.eid,
      cid,
      title: event.title,
      location: event.location,
      desc: event.desc,
      host: event.host,
      participants: event.participants,
      start_time: event.start_time.toISOString(),
      end_time: event.end_time.toISOString(),
    };
  }

  /**
   * Insert an event into database.
   */
  async insertEvent(cid: string, data: EventCreateReq): Promise<EventDetail> {
    const event = await this.eventRepository.save({
      title: data.title,
      desc: data.desc,
      start_time: new Date(data.start_time),
      end_time: new Date(data.end_time),
      location: data.location,
      host: data.host,
      participants: data.participants,
      client: {
        cid: cid,
      },
    });
    if (this.isValidEmail(data.host_email) && data.host_name) {
      const replacements = {
        name: data.host_name,
        title: data.title,
        desc: data.desc,
        startTime: data.start_time,
        endTime: data.end_time,
        location: data.location,
        host: data.host_name,
        message: 'You have created an event.',
      };
      const content = this.loadHTMLContent(replacements);
      await this.sendEmail([data.host_email], 'Event Created', content);
    }
    if (
      data.participants_email &&
      data.participants_name &&
      data.participants_email.length === data.participants_name.length
    ) {
      if (!(data.participants_email instanceof Array)) {
        // Prevents DoS.
        return;
      }
      for (let i = 0; i < data.participants_email.length; i++) {
        if (
          this.isValidEmail(data.participants_email[i]) &&
          data.participants_name[i]
        ) {
          const replacements = {
            name: data.participants_name[i],
            title: data.title,
            desc: data.desc,
            startTime: data.start_time,
            endTime: data.end_time,
            location: data.location,
            host: data.host_name,
            message: 'You have been invited to an event.',
          };
          const content = this.loadHTMLContent(replacements);
          await this.sendEmail(
            [data.participants_email[i]],
            'Event Invitation',
            content,
          );
        }
      }
    }
    return this.eventEntity2EventDetail(cid, event);
  }

  /**
   * Get all the events of a client based on client cid.
   */
  async getEvents(query: {
    cid: string;
    pid?: string;
  }): Promise<EventDetail[]> {
    const where = query.pid
      ? [
          // find events as host
          {
            client: {
              cid: query.cid,
            },
            host: query.pid,
          },

          // find events as participants
          {
            client: {
              cid: query.cid,
            },
            participants: In([query.pid]),
          },
        ]
      : // find all events from a client
        {
          client: {
            cid: query.cid,
          },
        };
    const events = await this.eventRepository.find({
      where: where,
    });

    return events.map((val) => this.eventEntity2EventDetail(query.cid, val));
  }

  /**
   * Get an event by eventID.
   */
  async getEvent(cid: string, eventID: string): Promise<EventDetail> {
    const event = await this.eventRepository.findOne({
      where: {
        client: {
          cid: cid,
        },
        eid: eventID,
      },
    });
    if (!event) {
      throw new NotFoundException('Event Not Found.');
    }

    return this.eventEntity2EventDetail(cid, event);
  }

  /**
   * Update an event by eventID.
   */
  async updateEvent(
    cid: string,
    eventID: string,
    updatedEvent: EventUpdateReq,
  ) {
    // const protectList = ['eid'];
    // protectList.forEach((key) => {
    //   if (key in updatedEvent) {
    //     delete updatedEvent[key];
    //   }
    // });
    const result = await this.eventRepository.update(
      {
        eid: eventID,
        client: {
          cid,
        },
      },
      updatedEvent,
    );

    if (result.affected !== 1) {
      throw new NotFoundException('Not found event');
    }

    if (updatedEvent.host_email && updatedEvent.host_name) {
      const replacements = {
        name: updatedEvent.host_name,
        title: updatedEvent.title,
        desc: updatedEvent.desc,
        startTime: updatedEvent.start_time,
        endTime: updatedEvent.end_time,
        location: updatedEvent.location,
        host: updatedEvent.host_name,
        message: 'You have updated an event.',
      };
      const content = this.loadHTMLContent(replacements);
      await this.sendEmail([updatedEvent.host_email], 'Event Updated', content);
    }
    if (
      updatedEvent.participants_email &&
      updatedEvent.participants_name &&
      updatedEvent.participants_email.length ===
        updatedEvent.participants_name.length
    ) {
      if (!(updatedEvent.participants_email instanceof Array)) {
        // Prevents DoS.
        return [];
      }
      for (let i = 0; i < updatedEvent.participants_email.length; i++) {
        if (
          this.isValidEmail(updatedEvent.participants_email[i]) &&
          updatedEvent.participants_name[i]
        ) {
          const replacements = {
            name: updatedEvent.participants_name[i],
            title: updatedEvent.title,
            desc: updatedEvent.desc,
            startTime: updatedEvent.start_time,
            endTime: updatedEvent.end_time,
            location: updatedEvent.location,
            host: updatedEvent.host_name,
            message: 'You have been invited to an event.',
          };
          const content = this.loadHTMLContent(replacements);
          await this.sendEmail(
            [updatedEvent.participants_email[i]],
            'Event Invitation',
            content,
          );
        }
      }
    }

    const event = await this.getEvent(cid, eventID);

    return event;
  }

  /**
   * Delete an event by eventID.
   * @param {string} eventID The event ID.
   */
  async deleteEvent(cid: string, eventID: string): Promise<boolean> {
    const event = await this.getEvent(cid, eventID);
    if (!event) {
      throw new NotFoundException(`Event Not Found.`);
    }

    const result = await this.eventRepository.delete(eventID);

    return result.affected === 1;
  }

  /**
   * Sending email function.
   * @param {string[]} receivers The receivers' email address.
   * @param {string} subject The email subject.
   * @param {string} content The email content.
   */
  async sendEmail(receivers: string[], subject: string, content: string) {
    const transporter = nodemailer.createTransport({
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      auth: {
        user: 'event4156-2@outlook.com',
        pass: '4156eventmanagement',
      },
      tls: {
        ciphers: 'SSLv3',
      },
    });
    await transporter.sendMail({
      from: 'event4156-2@outlook.com',
      to: receivers,
      subject: subject,
      html: content,
    });
  }

  /**
   * Check if a string is a valid email address.
   * @param {string} email The email address.
   */
  private isValidEmail(email: string) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  /**
   * Load email html template.
   */
  private loadHTMLContent(replacements) {
    const __dirname = path.resolve();
    const filePath = path.join(__dirname, 'src/pages/emailPage.html');
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    return template(replacements);
  }
}
