import { Prisma, User } from '@prisma/client';
import { hashText } from 'src/cryptHelper';
import { P } from 'src/types';

export async function hashPasswordMiddleware(
  params: Prisma.MiddlewareParams,
): P<Prisma.MiddlewareParams> {
  const user: User = params.args.data;

  const hash = await hashText(user.password);
  user.password = hash;
  params.args.data = user;

  return params;
}
