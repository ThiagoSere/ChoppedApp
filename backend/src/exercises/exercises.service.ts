import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';

type ExerciseDbItem = {
  id: string;
  name: string;
  bodyPart?: string;
  target?: string;
  equipment?: string;
  gifUrl?: string;
};

type FreeApiItem = {
  exerciseId: string;
  name: string;
  gifUrl?: string;
  bodyParts?: string[];
  targetMuscles?: string[];
  equipments?: string[];
};

type SearchPreset =
  | { kind: 'bodyPart'; value: string }
  | { kind: 'target'; value: string };

@Injectable()
export class ExercisesService {
  private readonly logger = new Logger(ExercisesService.name);

  private readonly baseUrl =
    process.env.EXERCISE_DB_BASE_URL || 'https://exercisedb.p.rapidapi.com';
  private readonly apiHost =
    process.env.EXERCISE_DB_API_HOST || 'exercisedb.p.rapidapi.com';
  private readonly apiKey = process.env.EXERCISE_DB_API_KEY || '';
  private readonly publicApiUrl =
    process.env.PUBLIC_API_URL || 'http://localhost:3001';
  private readonly freeApiUrl = 'https://oss.exercisedb.dev/api/v1';

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

  private normalizeUrl(url?: string): string {
    if (!url || typeof url !== 'string') return '';
    const v = url.trim();
    if (!v) return '';
    if (v.startsWith('//')) return `https:${v}`;
    if (v.startsWith('http://')) return v.replace('http://', 'https://');
    return v;
  }

  private buildGifProxyUrl(id: string): string {
    return `${this.publicApiUrl}/exercises/gif/${encodeURIComponent(id)}`;
  }

  private getRapidHeaders(): Record<string, string> {
    return {
      'x-rapidapi-key': this.apiKey,
      'x-rapidapi-host': this.apiHost,
    };
  }

  private async fetchExerciseDbJson(url: string, headers?: Record<string, string>): Promise<ExerciseDbItem[]> {
    const response = await fetch(url, {
      headers: headers ?? {},
    });

    if (!response.ok) {
      throw new InternalServerErrorException(
        `ExerciseDB devolvio ${response.status}`,
      );
    }

    const data = (await response.json()) as ExerciseDbItem[];
    return Array.isArray(data) ? data : [];
  }

  private async fetchFreeApiJson(url: string): Promise<FreeApiItem[]> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new InternalServerErrorException(
        `Free ExerciseDB devolvio ${response.status}`,
      );
    }
    const data = (await response.json()) as { success: boolean; data: FreeApiItem[] };
    return Array.isArray(data?.data) ? data.data : [];
  }

  private async tryFetchBinary(
    url: string,
    headers?: Record<string, string>,
  ): Promise<{ ok: true; buffer: Buffer; contentType: string } | { ok: false; reason: string }> {
    try {
      const response = await fetch(url, { headers });

      if (!response.ok) {
        return { ok: false, reason: `HTTP ${response.status} en ${url}` };
      }

      const contentType = response.headers.get('content-type') || '';
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (!buffer.length) {
        return { ok: false, reason: `Body vacio en ${url}` };
      }

      return {
        ok: true,
        buffer,
        contentType: contentType || 'image/gif',
      };
    } catch (err) {
      return {
        ok: false,
        reason: `Error de red en ${url}: ${err instanceof Error ? err.message : 'desconocido'}`,
      };
    }
  }

  private async tryFetchGifFromExerciseDetail(id: string): Promise<{
    buffer: Buffer;
    contentType: string;
  } | null> {
    if (!this.apiKey) return null;

    const url = `${this.baseUrl}/exercises/exercise/${encodeURIComponent(id)}`;
    try {
      const response = await fetch(url, { headers: this.getRapidHeaders() });
      if (!response.ok) return null;

      const data = (await response.json()) as ExerciseDbItem;
      const gifUrl = this.normalizeUrl(data?.gifUrl);
      if (!gifUrl) return null;

      const direct = await this.tryFetchBinary(gifUrl);
      if (direct.ok) return { buffer: direct.buffer, contentType: direct.contentType };

      return null;
    } catch {
      return null;
    }
  }

  async getGifBufferById(id: string): Promise<{
    buffer: Buffer;
    contentType: string;
  }> {
    const safeId = encodeURIComponent(id);
    const reasons: string[] = [];

    // 1) RapidAPI image endpoint (when API key is set)
    if (this.apiKey) {
      const rapidHeaders = this.getRapidHeaders();

      const rapidCandidates = [
        `${this.baseUrl}/image?exerciseId=${safeId}&resolution=360`,
        `${this.baseUrl}/image?exerciseId=${safeId}&resolution=180`,
        `https://exercisedb.p.rapidapi.com/image?exerciseId=${safeId}&resolution=360`,
        `https://exercisedb.p.rapidapi.com/image?exerciseId=${safeId}&resolution=180`,
      ];

      for (const candidate of rapidCandidates) {
        const res = await this.tryFetchBinary(candidate, rapidHeaders);
        if (res.ok) return { buffer: res.buffer, contentType: res.contentType };
        reasons.push(res.reason);
      }

      const fromDetail = await this.tryFetchGifFromExerciseDetail(id);
      if (fromDetail) return fromDetail;
      reasons.push('No se pudo obtener GIF desde detalle del ejercicio');
    } else {
      reasons.push('Sin EXERCISE_DB_API_KEY para endpoints RapidAPI');
    }

    // 2) Free OSS ExerciseDB CDN
    const ossCandidates = [
      `https://static.exercisedb.dev/media/${id}.gif`,
      `https://static.exercisedb.dev/media/${safeId}.gif`,
    ];
    for (const candidate of ossCandidates) {
      const res = await this.tryFetchBinary(candidate);
      if (res.ok) return { buffer: res.buffer, contentType: res.contentType };
      reasons.push(res.reason);
    }

    this.logger.warn(`GIF no disponible para ${id}`);
    throw new NotFoundException(`GIF no disponible para el ejercicio ${id}`);
  }

  async search(query: string, limit = 5) {
    const safeLimit = Math.max(1, Math.min(limit, 50));
    const normalized = this.normalizeText(query || 'pecho');
    const preset = this.muscleMap[normalized];

    // Use free API when no RapidAPI key is configured
    if (!this.apiKey) {
      let url: string;
      if (preset) {
        if (preset.kind === 'bodyPart') {
          url = `${this.freeApiUrl}/exercises?bodyParts=${encodeURIComponent(preset.value)}&limit=${safeLimit}`;
        } else {
          url = `${this.freeApiUrl}/exercises?targetMuscles=${encodeURIComponent(preset.value)}&limit=${safeLimit}`;
        }
      } else {
        url = `${this.freeApiUrl}/exercises?name=${encodeURIComponent(normalized)}&limit=${safeLimit}`;
      }

      const data = await this.fetchFreeApiJson(url);
      return data.slice(0, safeLimit).map((e) => ({
        exerciseId: e.exerciseId,
        name: e.name,
        bodyPart: e.bodyParts?.[0] ?? '',
        target: e.targetMuscles?.[0] ?? '',
        equipment: e.equipments?.[0] ?? '',
        gifUrl: this.normalizeUrl(e.gifUrl) || this.buildGifProxyUrl(e.exerciseId),
      }));
    }

    // RapidAPI path
    const headers = this.getRapidHeaders();
    let url: string;
    if (preset) {
      if (preset.kind === 'bodyPart') {
        url = `${this.baseUrl}/exercises/bodyPart/${encodeURIComponent(preset.value)}?offset=0&limit=${safeLimit}`;
      } else {
        url = `${this.baseUrl}/exercises/target/${encodeURIComponent(preset.value)}?offset=0&limit=${safeLimit}`;
      }
    } else {
      url = `${this.baseUrl}/exercises/name/${encodeURIComponent(normalized)}?offset=0&limit=${safeLimit}`;
    }

    const data = await this.fetchExerciseDbJson(url, headers);

    return data.slice(0, safeLimit).map((e) => ({
      exerciseId: e.id,
      name: e.name,
      bodyPart: e.bodyPart ?? '',
      target: e.target ?? '',
      equipment: e.equipment ?? '',
      gifUrl: this.buildGifProxyUrl(e.id),
    }));
  }
}
