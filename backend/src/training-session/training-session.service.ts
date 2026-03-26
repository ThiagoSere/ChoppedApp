import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingSession } from './entities/training-session.entity';
import { CompleteTrainingDto } from './dto/complete-training.dto';
import { Workout } from '../workouts/workouts.entity';

@Injectable()
export class TrainingSessionsService {
  constructor(
    @InjectRepository(TrainingSession)
    private readonly sessionsRepo: Repository<TrainingSession>,
    @InjectRepository(Workout)
    private readonly workoutsRepo: Repository<Workout>,
  ) {}

  async complete(userId: string, dto: CompleteTrainingDto) {
    const workout = await this.workoutsRepo.findOne({ where: { id: dto.workoutId } });

    if (!workout) {
      throw new NotFoundException('Rutina no encontrada');
    }
    if (workout.userId !== userId) {
      throw new ForbiddenException('No puedes completar rutinas de otro usuario');
    }
    if (!dto.entries.length) {
      throw new BadRequestException('No hay ejercicios para guardar');
    }
    if (dto.entries.some((e) => !e.done)) {
      throw new BadRequestException('Debes marcar todos los ejercicios antes de terminar');
    }

    const session = this.sessionsRepo.create({
      userId,
      workoutId: workout.id,
      workoutName: workout.name,
      entries: dto.entries,
    });

    return this.sessionsRepo.save(session);
  }

  async mine(userId: string) {
    return this.sessionsRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
