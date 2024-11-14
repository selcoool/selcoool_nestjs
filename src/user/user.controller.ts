import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}
    @Get()
    async getUsers(@Res() res: Response) {
      try {
        const allUsers = await this.userService.getUsers();
        return res.status(HttpStatus.OK).json(allUsers);
      } catch (error) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Error creating chat message',
          error: error.message,
        });
      }
    }
}
