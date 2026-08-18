const axios = require('axios');

class ApiService {
  constructor(baseURL, token) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request and response interceptors if needed
    this.axiosInstance.interceptors.request.use(
      (config) => {
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response) => {
        // You can handle successful responses here
        return response;
      },
      (error) => {
        // You can handle errors or failed responses here
        return Promise.reject(error);
      }
    );
  }

  // Define methods for HTTP requests (GET, POST, PUT, DELETE, etc.)
  get(url, config) {
    return this.axiosInstance.get(url, config);
  }
  post(url, data, config) {
    return this.axiosInstance.post(url, data, config);
  }
  put(url, data, config) {
    return this.axiosInstance.put(url, data, config);
  }
  delete(url, config) {
    return this.axiosInstance.delete(url, config);
  }
}

module.exports = ApiService;