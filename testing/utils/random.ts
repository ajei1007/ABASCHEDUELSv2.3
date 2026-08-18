export function generateRandomString(length: number = 8): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function generateUniqueEmail(): string {
  const timestamp = Date.now();
  const randomStr = generateRandomString(6);
  return `test.user.${randomStr}.${timestamp}@testmail.com`;
}

export function generateUniqueName(): string {
  const randomStr = generateRandomString(8);
  return randomStr.charAt(0).toUpperCase() + randomStr.slice(1);
}
