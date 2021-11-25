import { Module } from '@nestjs/common';
import { StarService } from './star.service';

@Module({
  providers: [StarService],
  exports: [StarService],
})
export class StarModule {}
