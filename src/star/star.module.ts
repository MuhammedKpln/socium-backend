import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StarService } from './star.service';

@Module({
  imports: [PrismaModule],
  providers: [StarService],
  exports: [StarService],
})
export class StarModule {}
