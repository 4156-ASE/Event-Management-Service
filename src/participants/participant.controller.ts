import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Param,
  Body,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ParticipantsService } from './participant.service';

@Controller('participants')
export class ParticipantsController {
  // Injecting ParticipantsService
  constructor(private readonly participantsService: ParticipantsService) {}

  // Invite a participant to an event
  @Post(':eventId')
  async inviteParticipant(
    @Param('eventId') eventId: string,  // Extract the 'eventId' parameter from the URL
    @Body() user: { first_name: string; last_name: string; email: string },  // Extract user details from the request body
  ) {
    try {
      // Use the service method to invite the participant
      await this.participantsService.inviteParticipant(eventId, user);
      return { message: 'Invitations sent successfully.' };
    } catch (e) {
      // Handle specific exceptions and re-throw them
      if (e instanceof NotFoundException) {
        throw new NotFoundException(e.message);
      } else {
        throw new InternalServerErrorException(
          'Failed to invite the participant',
        );
      }
    }
  }

  // Update the details of a participant in an event
  @Patch(':event_id/:pid')
  async updateParticipantDetails(
    @Param('event_id') eventId: string,  // Extract event id from URL
    @Param('pid') pid: number,  // Extract participant id from URL.
    @Body() user: { first_name: string; last_name: string; email: string },  // Extract user details from request body
  ) {
    try {
      // Use the service method to update participant details
      const updatedUser = await this.participantsService.updateParticipant(
        eventId,
        pid,
        user,
      );
      // Return the updated details
      return {
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        email: updatedUser.email,
      };
    } catch (e) {
      // Handle specific exceptions
      if (e instanceof NotFoundException) {
        throw new NotFoundException(e.message);
      } else {
        throw new InternalServerErrorException(
          'Failed to update the participant',
        );
      }
    }
  }

  // Delete a participant
  @Delete(':pid')
  async deleteParticipant(@Param('pid') pid: number) {  // Extract 'pid' from URL
    try {
      // Use the service method to delete the participant
      await this.participantsService.deleteParticipant(pid);
      return { message: 'Participant deleted successfully' };
    } catch (e) {
      // Handle exceptions
      if (e instanceof NotFoundException) {
        throw new NotFoundException(e.message);
      } else {
        throw new InternalServerErrorException(
          'Failed to delete the participant',
        );
      }
    }
  }

  // List participants of an event
  @Get(':eventId')
  async listParticipants(@Param('eventId') eventId: string) {
    try {
      // Fetch the participants using the service method
      const participants =
        await this.participantsService.listParticipants(eventId);
      // Map over the results to shape the response
      return participants.map((p) => ({
        pid: p.id,
        first_name: p.user.first_name,
        last_name: p.user.last_name,
        email: p.user.email,
        status: p.status,
      }));
    } catch (e) {
      // Handle exceptions
      if (e instanceof NotFoundException) {
        throw new NotFoundException(e.message);
      } else {
        throw new InternalServerErrorException('Failed to fetch participants');
      }
    }
  }

  // Update the status of a participant
  @Patch('respond')
  async updateParticipantStatus(
    @Body('pid') pid: number,
    @Body('status') status: string,
  ) {
    try {
      // Use the service method to update the participant's status
      await this.participantsService.updateStatus(pid, status);
      return {
        message:
          'Thank you for your response. We look forward to your participation!',
      };
    } catch (e) {
      // Handle exceptions
      if (e instanceof NotFoundException) {
        throw new NotFoundException(e.message);
      } else {
        throw new InternalServerErrorException('Failed to update the status');
      }
    }
  }
}
