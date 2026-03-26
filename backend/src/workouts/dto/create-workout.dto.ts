import {
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class WorkoutExerciseItemDto {
  @IsString() @IsNotEmpty() exerciseId: string;
  @IsString() @IsNotEmpty() name: string;
  @IsString() bodyPart?: string;
  @IsString() equipment?: string;
  @IsString() target?: string;
  @IsInt() @Min(1) sets: number;
  @IsString() @IsNotEmpty() reps: string;
}

export class CreateWorkoutDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutExerciseItemDto)
  exercises: WorkoutExerciseItemDto[];
}
