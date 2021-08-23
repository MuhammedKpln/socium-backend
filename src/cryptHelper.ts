import * as bcrypt from 'bcrypt';
import * as md5 from 'md5';

export async function hashText(password: string): Promise<string> {
  const saltRounds = 10;

  const hash = await bcrypt.hash(password, saltRounds);

  if (hash) {
    return hash;
  }

  throw new Error('Could not hash password');
}

export function hashWithMD5(password: string): string {
  return md5(password);
}

export function compareMD5(hash: string, secondHash: string): boolean {
  const hashedPrimaryHash = md5(hash);

  if (hashedPrimaryHash === secondHash) {
    return true;
  }

  return false;
}

export async function compareHash(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  const compare = await bcrypt.compare(plainPassword, hashedPassword);

  if (compare) {
    return true;
  }

  return false;
}
