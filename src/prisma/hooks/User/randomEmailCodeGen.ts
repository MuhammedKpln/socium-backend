import { Prisma } from '@prisma/client';

export function generateRandomEmailConfirmationCode(
  params: Prisma.MiddlewareParams,
): Prisma.MiddlewareParams {
  if (params.args.data?.password) {
    const randomCode = Math.floor(Math.random() * 100000 + 100000);

    params.args.data.emailConfirmationCode = randomCode;
  }

  return params;
}
