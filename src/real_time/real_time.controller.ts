import { Controller, Post, Body, HttpStatus, Res } from '@nestjs/common';
import { RealTimeService } from './real_time.service';
import { ChatMessageDto } from './dtos/chat.dto';
import { Response } from 'express';

@Controller('real-time')
export class RealTimeController {
  constructor(private readonly chatService: RealTimeService) {}

  @Post()
  async createMessage(@Body() message: ChatMessageDto, @Res() res: Response) {
    try {
      const newMessage = await this.chatService.createMessage(
        message.username,
        message.message,
        message.roomId,
      );
      return res.status(HttpStatus.CREATED).json(newMessage);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error creating chat message',
        error: error.message,
      });
    }
  }

 
}