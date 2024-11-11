import { Module } from '@nestjs/common';
import { RealTimeController } from './real_time.controller';
import { RealTimeService } from './real_time.service';
import { Real_Time_Gateway } from './real_time_api';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [RealTimeController],
  providers: [RealTimeService,Real_Time_Gateway,PrismaService]
})
export class RealTimeModule {}
