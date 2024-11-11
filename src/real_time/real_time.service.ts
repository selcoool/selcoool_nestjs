import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class RealTimeService  {
  constructor(private prisma: PrismaService) {}

  // Create a new chat message
  async createMessage(username: string, message: string, roomId?: string) {
    return this.prisma.m.create({
      data: {
        username,
        message,
        roomId,
      },
    });
  }

  // Fetch messages
  async getMessages() {
    return this.prisma.m.findMany();
  }

  // Fetch messages by roomId
  async getMessagesByRoom(roomId: string) {
    return this.prisma.m.findMany({
      where: {
        roomId,
      },
    });
  }


}