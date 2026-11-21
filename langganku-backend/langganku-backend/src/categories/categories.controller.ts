import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoryDto } from './dto/category.dto';

const categoryIdPipe = new ParseUUIDPipe({
  exceptionFactory: () => new NotFoundException('Kategori tidak ditemukan.'),
});

@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Post()
  create(@Body() dto: CategoryDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id', categoryIdPipe) id: string, @Body() dto: CategoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', categoryIdPipe) id: string) {
    await this.service.remove(id);
  }
}
