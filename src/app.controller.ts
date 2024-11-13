import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaService,
  
  ) {}

  @Get()
  async getHello() {
    return await this.prismaService.m.findMany();
    // return "hello"
  }

 
}
