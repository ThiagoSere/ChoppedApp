import {
  Controller,
  Get,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Param,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ExercisesService } from './exercises.service';

@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get('search')
  search(
    @Query('q', new DefaultValuePipe('pecho')) q: string,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    return this.exercisesService.search(q, limit);
  }

  @Get('gif/:id')
  async gif(@Param('id') id: string, @Res() res: Response) {
    const { buffer, contentType } =
      await this.exercisesService.getGifBufferById(id);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(buffer);
  }
}
