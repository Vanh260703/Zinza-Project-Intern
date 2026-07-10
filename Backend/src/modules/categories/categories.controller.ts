import { Controller, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';

// [GET] /api/v1/categories — danh sách thể loại, public (không cần đăng nhập)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }
}
