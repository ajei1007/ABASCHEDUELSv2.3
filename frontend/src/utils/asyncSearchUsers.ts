import axios from 'axios';

// Custom debounce implementation
function debouncePromise<T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number,
): T {
  let timeout: number | null = null;
  let promise: Promise<any> | null = null;
  let resolveList: Array<(value: any) => void> = [];

  return function (...args: Parameters<T>): Promise<ReturnType<T>> {
    if (timeout) {
      window.clearTimeout(timeout);
    }

    if (!promise) {
      promise = new Promise((resolve) => {
        resolveList.push(resolve);
      });
    }

    timeout = window.setTimeout(async () => {
      const result = await func(...args);
      resolveList.forEach((resolve) => resolve(result));
      resolveList = [];
      promise = null;
    }, wait);

    return promise;
  } as T;
}

const asyncSearchUsers = debouncePromise(async (value: string) => {
  const params = { query: value, limit: 100 };
  const res = await axios.get(`/users/autocomplete`, { params });
  const users = res.data;

  return users.map((p: any) => ({
    label: p?.label,
    value: p.id,
    address: p?.address,
  }));
}, 300);

export default asyncSearchUsers;
