export class WorkoutResponseDto {
  id: string;
  name: string;
  description?: string;
  duration: number;
  difficulty?: string;
  exercises: Array<{
    exerciseId: string;
    name: string;
    bodyPart?: string;
    equipment?: string;
    target?: string;
    sets: number;
    reps: string;
  }>;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
