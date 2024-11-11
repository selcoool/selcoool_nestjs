import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { ChatModule } from './chat/chat.module';

import { RealTimeModule } from './real_time/real_time.module';
import { PrismaService } from './prisma.service';
import { UserModule } from './user/user.module';



// RealTimeModule,

@Module({
  imports: [ RealTimeModule, UserModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
