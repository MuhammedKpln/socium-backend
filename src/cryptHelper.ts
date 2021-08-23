import * as bcrypt from 'bcrypt';

export async function cryptPassword(password: string): Promise<string> {
  const saltRounds = 10;

  const hash = await bcrypt.hash(password, saltRounds);

  if (hash) {
    return hash;
  }

  throw new Error('Could not hash password');
}

export async function comparePassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  const compare = await bcrypt.compare(plainPassword, hashedPassword);

  if (compare) {
    return true;
  }

  return false;
}
