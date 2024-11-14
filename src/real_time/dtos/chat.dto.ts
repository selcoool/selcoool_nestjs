import { Type } from 'class-transformer';
import { IsString, IsEmail, IsOptional, IsNumber, IsBoolean,IsDateString, IsNotEmpty } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  username: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  roomId?: string; // Room ID is optional
}