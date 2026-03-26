import { Injectable, InternalServerErrorException } from '@nestjs/common';

type ExerciseDbItem = {
  id: string;
  name: string;
  bodyPart?: string;
  target?: string;
  equipment?: string;
  gifUrl?: string;
};

type SearchPreset =
  | { kind: 'bodyPart'; value: string }
  | { kind: 'target'; value: string };

@Injectable()
export class ExercisesService {
  private readonly baseUrl =
    process.env.EXERCISE_DB_BASE_URL || 'https://exercisedb.p.rapidapi.com';
  private readonly apiHost =
    process.env.EXERCISE_DB_API_HOST || 'exercisedb.p.rapidapi.com';
  private readonly apiKey = process.env.EXERCISE_DB_API_KEY || '';

  private readonly muscleMap: Record<string, SearchPreset> = {
    pecho: { kind: 'bodyPart', value: 'chest' },
    espalda: { kind: 'bodyPart', value: 'back' },
    piernas: { kind: 'bodyPart', value: 'upper legs' },
    pierna: { kind: 'bodyPart', value: 'upper legs' },
    hombros: { kind: 'bodyPart', value: 'shoulders' },
    hombro: { kind: 'bodyPart', value: 'shoulders' },
    brazos: { kind: 'bodyPart', value: 'upper arms' },
    brazo: { kind: 'bodyPart', value: 'upper arms' },
    biceps: { kind: 'target', value: 'biceps' },
    triceps: { kind: 'target', value: 'triceps' },
    abdominales: { kind: 'bodyPart', value: 'waist' },
    abdomen: { kind: 'bodyPart', value: 'waist' },
    gluteos: { kind: 'target', value: 'glutes' },
    gluteo: { kind: 'target', value: 'glutes' },
    pantorrillas: { kind: 'target', value: 'calves' },
    pantorrilla: { kind: 'target', value: 'calves' },
  };

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  private async fetchExerciseDb(url: string): Promise<ExerciseDbItem[]> {
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': this.apiKey,
        'x-rapidapi-host': this.apiHost,
      },
    });

    if (!response.ok) {
      throw new InternalServerErrorException(
        `ExerciseDB devolvio ${response.status}`,
      );
    }

    const data = (await response.json()) as ExerciseDbItem[];
    return Array.isArray(data) ? data : [];
  }

  async search(query: string, limit = 5) {
    if (!this.apiKey) {
      throw new InternalServerErrorException(
        'Falta EXERCISE_DB_API_KEY en variables de entorno',
      );
    }

    const safeLimit = Math.max(1, Math.min(limit, 20));
    const normalized = this.normalizeText(query || 'pecho');
    const preset = this.muscleMap[normalized];

    let url: string;
    if (preset) {
      if (preset.kind === 'bodyPart') {
        url = `${this.baseUrl}/exercises/bodyPart/${encodeURIComponent(preset.value)}?offset=0&limit=${safeLimit}`;
      } else {
        url = `${this.baseUrl}/exercises/target/${encodeURIComponent(preset.value)}?offset=0&limit=${safeLimit}`;
      }
    } else {
      // fallback: busqueda por nombre
      url = `${this.baseUrl}/exercises/name/${encodeURIComponent(normalized)}?offset=0&limit=${safeLimit}`;
    }

    const data = await this.fetchExerciseDb(url);

    return data.slice(0, safeLimit).map((e) => ({
      exerciseId: e.id,
      name: e.name,
      bodyPart: e.bodyPart ?? '',
      target: e.target ?? '',
      equipment: e.equipment ?? '',
      gifUrl: e.gifUrl ?? '',
    }));
  }
}
