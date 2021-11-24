import * as md5 from 'md5';
import * as argon2 from 'argon2';

export async function hashText(password: string): Promise<string> {
  const hash = await argon2.hash(password);

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
  const compare = await argon2.verify(hashedPassword, plainPassword);

  if (compare) {
    return true;
  }

  return false;
}
