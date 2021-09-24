import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Star } from './entities/star.entity';
import { StarController } from './star.controller';
import { StarService } from './star.service';

@Module({
  imports: [TypeOrmModule.forFeature([Star])],
  controllers: [StarController],
  providers: [StarService],
  exports: [TypeOrmModule, StarService],
})
export class StarModule {}
