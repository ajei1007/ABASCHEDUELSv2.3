import axios, { type Axios } from 'axios';

export class MmApiClient {
  private api: Axios;

  constructor({ baseUrl, authToken }: { baseUrl: string; authToken?: string }) {
    this.api = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
      xsrfCookieName: 'MMCSRF',
    });
  }

  async makeRequest<T>(config: {
    method: 'get' | 'post' | 'put' | 'delete';
    url: string;
    data?: any;
    params?: any;
    signal?: AbortSignal;
  }): Promise<T> {
    const response = await this.api.request<T>({
      method: config.method,
      url: config.url,
      data: config.data,
      params: config.params,
      signal: config.signal,
    });
    return response.data;
  }

  setAuthToken(token: string) {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  clearAuthToken() {
    delete this.api.defaults.headers.common['Authorization'];
  }
  isCancelled(error: any): boolean {
    return axios.isCancel(error);
  }
}
