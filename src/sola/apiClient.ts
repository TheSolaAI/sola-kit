import { ApiResponse, ApiError } from '@/types/api.types';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';

type ServiceType = 'data' | 'wallet' | 'goatIndex' | 'nextjs';

interface ApiClientOptions {
  dataServiceUrl?: string;
  walletServiceUrl?: string;
  goatIndexServiceUrl?: string;
  nextjsServiceUrl?: string;
  enableLogging?: boolean;
}

export class ApiClient {
  private dataClient: AxiosInstance | null = null;
  private walletClient: AxiosInstance | null = null;
  private goatIndexClient: AxiosInstance | null = null;
  private nextjsClient: AxiosInstance | null = null;
  private options: ApiClientOptions;

  constructor(options: ApiClientOptions = {}) {
    this.options = {
      ...options,
      enableLogging: options.enableLogging ?? true,
    };

    // Initialize clients only if URLs are provided
    if (options.dataServiceUrl) {
      this.dataClient = this.createClient(options.dataServiceUrl, 'data');
    }

    if (options.walletServiceUrl) {
      this.walletClient = this.createClient(options.walletServiceUrl, 'wallet');
    }

    if (options.goatIndexServiceUrl) {
      this.goatIndexClient = this.createClient(
        options.goatIndexServiceUrl,
        'goatIndex'
      );
    }

    if (options.nextjsServiceUrl) {
      this.nextjsClient = this.createClient(options.nextjsServiceUrl, 'nextjs');
    }

    if (this.options.enableLogging) {
      console.log(`ApiClient initialized with options:`, {
        dataUrl: options.dataServiceUrl
          ? `${options.dataServiceUrl}`
          : 'not set',
        walletUrl: options.walletServiceUrl
          ? `${options.walletServiceUrl}`
          : 'not set',
        goatIndexUrl: options.goatIndexServiceUrl
          ? `${options.goatIndexServiceUrl}`
          : 'not set',
        nextjsUrl: options.nextjsServiceUrl
          ? `${options.nextjsServiceUrl}`
          : 'not set',
        logging: this.options.enableLogging,
      });
    }
  }

  /**
   * Creates an Axios client with common configuration, axios-retry settings,
   * and request/response interceptors for logging.
   */
  private createClient(
    baseURL: string,
    serviceType: ServiceType
  ): AxiosInstance {
    const client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for logging
    client.interceptors.request.use(
      config => {
        if (this.options.enableLogging) {
          const authHeader = config.headers.Authorization
            ? 'Bearer [REDACTED]'
            : 'none';

          console.log(`🚀 [${serviceType.toUpperCase()}] Request:`, {
            method: config.method?.toUpperCase(),
            url: `${config.baseURL}${config.url}`,
            params: config.params || 'none',
            headers: {
              ...config.headers,
              Authorization: authHeader,
            },
            data: config.data || 'none',
            timestamp: new Date().toISOString(),
          });
        }
        return config;
      },
      error => {
        if (this.options.enableLogging) {
          console.error(
            `❌ [${serviceType.toUpperCase()}] Request error:`,
            error
          );
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging
    client.interceptors.response.use(
      response => {
        if (this.options.enableLogging) {
          console.log(`✅ [${serviceType.toUpperCase()}] Response:`, {
            status: response.status,
            statusText: response.statusText,
            url: response.config.url,
            headers: response.headers,
            // Log a preview of the response data instead of the full payload
            dataPreview: this.createDataPreview(response.data),
            timestamp: new Date().toISOString(),
          });
        }
        return response;
      },
      error => {
        if (this.options.enableLogging) {
          const errorResponse = error.response;
          console.error(`❌ [${serviceType.toUpperCase()}] Response error:`, {
            message: error.message,
            code: error.code,
            status: errorResponse?.status || 'No status',
            statusText: errorResponse?.statusText || 'No status text',
            url: error.config?.url || 'Unknown URL',
            data: errorResponse?.data || 'No data',
            timestamp: new Date().toISOString(),
          });
        }
        return Promise.reject(error);
      }
    );

    // Retry on network errors or server errors (>=500)
    axiosRetry(client, {
      retries: 3,
      retryDelay: retryCount => {
        const delay = axiosRetry.exponentialDelay(retryCount);
        if (this.options.enableLogging) {
          console.log(
            `🔄 [${serviceType.toUpperCase()}] Retrying request... Attempt ${retryCount}, waiting ${delay}ms`
          );
        }
        return delay;
      },
      retryCondition: error => {
        if (error.code === 'ECONNABORTED' || axiosRetry.isNetworkError(error)) {
          return true;
        }
        return !!(error.response && error.response.status >= 500);
      },
    });

    return client;
  }

  /**
   * Creates a preview of the data to avoid logging large payloads
   */
  private createDataPreview(data: any): any {
    if (!data) return 'none';

    if (typeof data === 'object') {
      if (Array.isArray(data)) {
        return `Array with ${data.length} items`;
      }

      // For objects, show keys and truncate values if they're large
      const preview: Record<string, any> = {};
      Object.keys(data).forEach(key => {
        const value = data[key];
        if (typeof value === 'object' && value !== null) {
          preview[key] = Array.isArray(value)
            ? `Array with ${value.length} items`
            : `Object with keys: ${Object.keys(value).join(', ')}`;
        } else if (typeof value === 'string' && value.length > 100) {
          preview[key] = `${value.substring(0, 100)}...`;
        } else {
          preview[key] = value;
        }
      });
      return preview;
    }

    return data;
  }

  /**
   * Returns the appropriate Axios client based on the service type.
   */
  private getClient(service: ServiceType, authToken?: string): AxiosInstance {
    let client: AxiosInstance | null;

    switch (service) {
      case 'data':
        client = this.dataClient;
        break;
      case 'wallet':
        client = this.walletClient;
        break;
      case 'goatIndex':
        client = this.goatIndexClient;
        break;
      case 'nextjs':
        client = this.nextjsClient;
        break;
      default:
        throw new Error(`Unsupported service type: ${service}`);
    }

    if (!client) {
      throw new Error(`Client for service ${service} is not initialized`);
    }

    // Add auth token to request if provided
    if (authToken) {
      // Create a new instance with the auth token
      const newClient = axios.create(client.defaults);

      // Apply the same logging interceptors to the new client
      this.addLoggingInterceptors(newClient, service);

      newClient.defaults.headers.common['Authorization'] =
        `Bearer ${authToken}`;
      return newClient;
    }

    return client;
  }

  /**
   * Adds logging interceptors to a client
   */
  private addLoggingInterceptors(
    client: AxiosInstance,
    serviceType: ServiceType
  ): void {
    // Request interceptor for logging
    client.interceptors.request.use(
      config => {
        if (this.options.enableLogging) {
          const authHeader = config.headers.Authorization;
          // ? 'Bearer [REDACTED]'
          // : 'none';

          console.log(`🚀 [${serviceType.toUpperCase()}] Request:`, {
            method: config.method?.toUpperCase(),
            url: `${config.baseURL}${config.url}`,
            params: config.params || 'none',
            headers: {
              ...config.headers,
              Authorization: authHeader,
            },
            data: config.data || 'none',
            timestamp: new Date().toISOString(),
          });
        }
        return config;
      },
      error => {
        if (this.options.enableLogging) {
          console.error(
            `❌ [${serviceType.toUpperCase()}] Request error:`,
            error
          );
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging
    client.interceptors.response.use(
      response => {
        if (this.options.enableLogging) {
          console.log(`✅ [${serviceType.toUpperCase()}] Response:`, {
            status: response.status,
            statusText: response.statusText,
            url: response.config.url,
            headers: response.headers,
            // Log a preview of the response data instead of the full payload
            dataPreview: this.createDataPreview(response.data),
            timestamp: new Date().toISOString(),
          });
        }
        return response;
      },
      error => {
        if (this.options.enableLogging) {
          const errorResponse = error.response;
          console.error(`❌ [${serviceType.toUpperCase()}] Response error:`, {
            message: error.message,
            code: error.code,
            status: errorResponse?.status || 'No status',
            statusText: errorResponse?.statusText || 'No status text',
            url: error.config?.url || 'Unknown URL',
            data: errorResponse?.data || 'No data',
            timestamp: new Date().toISOString(),
          });
        }
        return Promise.reject(error);
      }
    );
  }

  private handleResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return { success: true, data: response.data };
  }

  /**
   * Handles errors for both auth and data services.
   */
  private handleError(error: AxiosError, service: ServiceType): ApiError {
    if (error.response) {
      const { status, data } = error.response;

      if (service === 'data') {
        if (data && typeof data === 'object' && 'error' in data) {
          const detail = (data as any).error as string;
          return {
            success: false,
            type: 'data_error',
            errors: [
              {
                code: 'error',
                detail,
                attr: null,
              },
            ],
            statusCode: status,
          };
        }
      }

      // Generic error handling for all services
      return {
        success: false,
        type: 'unknown_error',
        errors: [
          {
            code: 'unknown',
            detail: 'An unexpected error occurred.',
            attr: null,
          },
        ],
        statusCode: status,
      };
    }

    // No response (network error)
    return {
      success: false,
      type: 'network_error',
      errors: [
        {
          code: 'network',
          detail: error.message || 'Network error',
          attr: null,
        },
      ],
    };
  }

  /**
   * Generic request handler that executes the provided request function.
   */
  private async request<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    service: ServiceType
  ): Promise<ApiResponse<T> | ApiError> {
    try {
      const response = await requestFn();
      return this.handleResponse(response);
    } catch (err) {
      const error = err as AxiosError;
      return this.handleError(error, service);
    }
  }

  // HTTP methods with optional auth token parameter
  async get<T>(
    url: string,
    params?: Record<string, any>,
    service: ServiceType = 'data',
    authToken?: string
  ): Promise<ApiResponse<T> | ApiError> {
    if (this.options.enableLogging) {
      console.log(`🔍 [${service.toUpperCase()}] GET request initiated:`, {
        url,
        params,
      });
    }

    const client = this.getClient(service, authToken);
    return this.request<T>(() => client.get<T>(url, { params }), service);
  }

  async post<T>(
    url: string,
    data: any,
    service: ServiceType = 'data',
    authToken?: string
  ): Promise<ApiResponse<T> | ApiError> {
    if (this.options.enableLogging) {
      console.log(`📝 [${service.toUpperCase()}] POST request initiated:`, {
        url,
      });
    }

    const client = this.getClient(service, authToken);
    return this.request<T>(() => client.post<T>(url, data), service);
  }

  async put<T>(
    url: string,
    data: any,
    service: ServiceType = 'data',
    authToken?: string
  ): Promise<ApiResponse<T> | ApiError> {
    if (this.options.enableLogging) {
      console.log(`📤 [${service.toUpperCase()}] PUT request initiated:`, {
        url,
      });
    }

    const client = this.getClient(service, authToken);
    return this.request<T>(() => client.put<T>(url, data), service);
  }

  async patch<T>(
    url: string,
    data: any,
    service: ServiceType = 'data',
    authToken?: string
  ): Promise<ApiResponse<T> | ApiError> {
    if (this.options.enableLogging) {
      console.log(`🔧 [${service.toUpperCase()}] PATCH request initiated:`, {
        url,
      });
    }

    const client = this.getClient(service, authToken);
    return this.request<T>(() => client.patch<T>(url, data), service);
  }

  async delete<T>(
    url: string,
    service: ServiceType = 'data',
    authToken?: string
  ): Promise<ApiResponse<T> | ApiError> {
    if (this.options.enableLogging) {
      console.log(`🗑️ [${service.toUpperCase()}] DELETE request initiated:`, {
        url,
      });
    }

    const client = this.getClient(service, authToken);
    return this.request<T>(() => client.delete<T>(url), service);
  }

  // Type checker functions
  static isApiResponse<T>(response: any): response is ApiResponse<T> {
    return response && response.success === true;
  }

  static isApiError(response: any): response is ApiError {
    return (
      response && response.success === false && Array.isArray(response.errors)
    );
  }

  /**
   * Enable or disable logging
   */
  setLogging(enabled: boolean): void {
    if (this.options.enableLogging !== enabled) {
      console.log(`ApiClient logging ${enabled ? 'enabled' : 'disabled'}`);
      this.options.enableLogging = enabled;
    }
  }
}

// Example of creating an API client
export function createApiClient(options: ApiClientOptions) {
  return new ApiClient(options);
}
