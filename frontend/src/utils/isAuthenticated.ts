import { decodeJwt } from 'jose';

export function isAuthenticated() {
  const token = localStorage.getItem('token');
  if (!token) {
    return;
  }

  const date = new Date().getTime() / 1000;
  const data = decodeJwt(token);
  if (!data || !data.exp) {
    return;
  }

  return date < data.exp;
}
