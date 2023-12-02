import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParticipantEntity } from './models/participant.entity';

import { EventEntity } from 'src/events/models/event.entity';
import { UserEntity } from 'src/users/models/user.entity';
import { createTransport } from 'nodemailer';
import * as path from 'path';
import * as handlebars from 'handlebars';
import * as fs from 'fs';

@Injectable()
export class ParticipantsService {
  // Injects the repositories for participant, user, and event entities
  constructor(
    @InjectRepository(ParticipantEntity)
    private participantRepository: Repository<ParticipantEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(EventEntity)
    private readonly eventRepository: Repository<EventEntity>,
  ) {}

  // Invite a participant to a given event.
  async inviteParticipant(
    eventId: string,
    user: { first_name: string; last_name: string; email: string },
  ): Promise<void> {
    // Retrieve the event from the database
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    // Throw an exception if the event is not found
    if (!event) {
      throw new NotFoundException(`Event not found`);
    }

    // Check if the user with the provided email exists
    const foundUser = await this.userRepository.findOne({
      where: { email: user.email },
    });

    // Throw an exception if the user is not found
    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    // Check if the user is already a participant for the event
    const existingParticipant = await this.participantRepository.findOne({
      where: {
        event: event,
        user: foundUser,
      },
    });

    // Throw a conflict exception if the user is already a participant
    if (existingParticipant) {
      throw new ConflictException('Participant already exists in the event');
    }

    // Create a new participant and associate it with the user and event
    const newParticipant = new ParticipantEntity();
    newParticipant.event = event;
    newParticipant.user = foundUser;
    newParticipant.status = 'invited';

    // Save the new participant to the database
    try {
      await this.participantRepository.save(newParticipant);
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to invite the participant',
      );
    }
  }

  // Update details of an existing participant
  async updateParticipant(
    eventId: string,
    pid: string,
    user: { first_name: string; last_name: string; email: string },
  ): Promise<UserEntity> {
    // Retrieve the event from the database
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    // Throw an exception if the event is not found
    if (!event) {
      throw new NotFoundException(`Event not found`);
    }

    // Check if the user is a participant of the given event
    const participant = await this.participantRepository.findOne({
      where: {
        user: { pid: pid },
        event: { id: eventId },
      },
    });

    // Throw an exception if the user is not associated with the event
    if (!participant) {
      throw new NotFoundException(`Participant not associated with this event`);
    }

    // Retrieve the user from the database using the participant ID
    const foundUser = await this.userRepository.findOne({
      where: { pid: pid },
    });

    // Throw an exception if the user is not found
    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    // Update the user's details
    foundUser.first_name = user.first_name;
    foundUser.last_name = user.last_name;
    foundUser.email = user.email;

    // Save the updated user details to the database
    return await this.userRepository.save(foundUser);
  }

  // Delete a participant
  async deleteParticipant(pid: string): Promise<void> {
    const result = await this.participantRepository.delete(pid);
    // Throw an exception if no rows were affected
    if (result.affected === 0) {
      throw new NotFoundException('Participant not found');
    }
  }

  // Retrieve a list of participants for a given event
  async listParticipants(eventId: string): Promise<ParticipantEntity[]> {
    // Find all participants associated with the event and return them along with their user details
    return await this.participantRepository.find({
      where: { event: { id: eventId } },
      relations: ['user'],
    });
  }

  // Update a participant's response status
  async updateStatus(pid: number, eventId: string, status: string): Promise<void> {
    // Retrieve the participant from the database
    const participant = await this.participantRepository.findOne({
      where: {
        user: { id: pid },
        event: { id: eventId },
      }
    });

    // Throw an exception if the participant is not found
    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    // Update the participant's status
    participant.status = status;

    // Save the updated status to the database
    await this.participantRepository.save(participant);
  }

  async sendEmailToAllParticipants(eventId: string): Promise<void> {
    // Retrieve the event from the database
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    // Throw an exception if the event is not found
    if (!event) {
      throw new NotFoundException(`Event not found`);
    }

    // Retrieve all participants for the event
    const participants = await this.participantRepository.find({
      where: { event: { id: eventId } },
      relations: ['user'],
    });

    // Send email to each participant
    for (const participant of participants) {
      // Check if the participant is invited
      if (participant.status === 'pending') {
        // Send an email to the participant
        await this.sendEmail(participant.user.id, eventId);
      }
    }
  }

  async sendEmail(pid: number, eventId: string): Promise<void> {
    // Check if the receiver is a valid email address
    const receiver = await this.userRepository.findOne({
      where: { id: pid },
    });
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });
    if (!receiver.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new InternalServerErrorException('Invalid email address');
    }
    
    // Retrieve the email web page template
    const __dirname = path.resolve();
    const filePath = path.join(__dirname, "src/pages/emailPage.html")
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
      memberId: pid,
      eventId: eventId,
      firstname: receiver.first_name,
      lastname: receiver.last_name,
      host: event.host,
      title: event.title,
      description: event.desc,
      startTime: event.start_time,
      endTime: event.end_time,
      location: event.location,
    };
    const htmlToSend = template(replacements);
    
    // Send the email
    let transporter = createTransport({
      host: "smtp-mail.outlook.com", // Outlook SMTP server
      port: 587,                     // SMTP port (587 is typically used for TLS)
      secure: false,                 // True for 465, false for other ports
      auth: {
          user: "event4156@outlook.com", // Your Outlook email address
          pass: "4156eventmanagement"          // Your Outlook password
      },
      tls: {
          ciphers:'SSLv3'            // Necessary TLS configuration
      }
    });

    let info = await transporter.sendMail({
      from: 'event4156@outlook.com',
      to: receiver.email,
      subject: "You are invited to join an event!",
      html: htmlToSend
    });
  }

  getRedirectPage(): string {
    // Retrieve the email web page template
    console.log("get redirect page");
    const __dirname = path.resolve();
    const filePath = path.join(__dirname, "src/pages/responsePage.html")
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
    };
    const htmlToSend = template(replacements);

    return htmlToSend;
  }

}
