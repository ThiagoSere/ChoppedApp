import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingSession } from './training-session.entity';
import { TrainingSessionsService } from '../training-session.service';
import { TrainingSessionsController } from '../training-session.controller';
import { Workout } from '../../workouts/workouts.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TrainingSession, Workout])],
  controllers: [TrainingSessionsController],
  providers: [TrainingSessionsService],
  exports: [TrainingSessionsService],
})
export class TrainingSessionsModule {}
