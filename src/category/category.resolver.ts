import { Args, Query, Resolver } from '@nestjs/graphql';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';

@Resolver((_) => Category)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @Query((_) => [Category])
  async categories() {
    return await this.categoryService.listAllCategories();
  }

  @Query((_) => Category)
  async category(@Args('id') id: number) {
    return await this.categoryService.getOneById(id);
  }
}
