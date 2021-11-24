import { Prisma } from '@prisma/client';

export function generateRandomEmailConfirmationCode(
  params: Prisma.MiddlewareParams,
): Prisma.MiddlewareParams {
  if (params.action == 'create' && params.model === 'User') {
    const randomCode = Math.floor(Math.random() * 100000 + 100000);

    params.args.data.emailConfirmationCode = randomCode;
  }

  return params;
}
