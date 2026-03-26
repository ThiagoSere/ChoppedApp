import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TrainingSessionsService } from './training-session.service';
import { CompleteTrainingDto } from './dto/complete-training.dto';

@Controller('training-sessions')
@UseGuards(JwtAuthGuard)
export class TrainingSessionsController {
  constructor(private readonly sessionsService: TrainingSessionsService) {}

  @Post('complete')
  complete(
    @Req() req: Request & { user: { userId: string } },
    @Body() dto: CompleteTrainingDto,
  ) {
    return this.sessionsService.complete(req.user.userId, dto);
  }

  @Get('mine')
  mine(@Req() req: Request & { user: { userId: string } }) {
    return this.sessionsService.mine(req.user.userId);
  }
}
