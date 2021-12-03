import { PrismaClient } from '@prisma/client';
import { DoneCallback, Job } from 'bull';

//TODO: make it functional
export default async function (job: Job<{ roomId: number }>, cb: DoneCallback) {
  const prisma = new PrismaClient();

  await prisma.$connect();

  await prisma.room.delete({
    where: {
      id: job.data.roomId,
    },
  });

  await prisma.$disconnect();

  cb(null, true);
}
