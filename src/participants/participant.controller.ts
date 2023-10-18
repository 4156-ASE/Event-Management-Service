import {
    Controller,
    Post,
    Put,
    Delete,
    Get,
    Param,
    Body,
    NotFoundException,
    InternalServerErrorException
  } from '@nestjs/common';
  import { ParticipantsService } from './participant.service';
  
  @Controller()
  export class ParticipantsController {
    constructor(private readonly participantsService: ParticipantsService) {}
  
    @Post('events/:event_id/invite')
    async inviteParticipant(@Param('event_id') eventId: string, @Body() user: { first_name: string, last_name: string, email: string }) {
      try {
        await this.participantsService.inviteParticipant(eventId, user);
        return { message: "Invitations sent successfully." };
      } catch (e) {
        if (e instanceof NotFoundException) {
          throw new NotFoundException(e.message);
        } else {
          throw new InternalServerErrorException('Failed to invite the participant');
        }
      }
    }
  
    @Put('updateParticipant/:event_id/:pid')
    async updateParticipantDetails(@Param('event_id') eventId: string, @Param('pid') pid: number, @Body() user: { first_name: string, last_name: string, email: string }) {
      try {
        const updatedUser = await this.participantsService.updateParticipant(eventId, pid, user);
        return {
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
          email: updatedUser.email
        };
      } catch (e) {
        if (e instanceof NotFoundException) {
          throw new NotFoundException(e.message);
        } else {
          throw new InternalServerErrorException('Failed to update the participant');
        }
      }
    }
  
    @Delete('deleteParticipant/:event_id/:pid')
    async deleteParticipant(@Param('event_id') eventId: string, @Param('pid') pid: number) {
      try {
        await this.participantsService.deleteParticipant(eventId, pid);
      } catch (e) {
        if (e instanceof NotFoundException) {
          throw new NotFoundException(e.message);
        } else {
          throw new InternalServerErrorException('Failed to delete the participant');
        }
      }
    }
  
    @Get('events/:event_id/participants')
    async listParticipants(@Param('event_id') eventId: string) {
      try {
        const participants = await this.participantsService.listParticipants(eventId);
        return participants.map(p => ({
            first_name: p.user.first_name,
            last_name: p.user.last_name,
            email: p.user.email,
            status: p.status
          }));
        } catch (e) {
          if (e instanceof NotFoundException) {
            throw new NotFoundException(e.message);
          } else {
            throw new InternalServerErrorException('Failed to fetch participants');
          }
        }
      }
    
      @Put('updateStatus')
      async updateParticipantStatus(
        @Body('event_id') eventId: string,
        @Body('pid') pid: number,
        @Body('status') status: string
      ) {
        try {
          await this.participantsService.updateStatus(eventId, pid, status);
          return {
            message: "Thank you for your response. We look forward to your participation!"
          };
        } catch (e) {
          if (e instanceof NotFoundException) {
            throw new NotFoundException(e.message);
          } else {
            throw new InternalServerErrorException('Failed to update the status');
          }
        }
      }
    }
    
  