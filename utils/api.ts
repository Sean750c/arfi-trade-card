import md5 from 'md5';

const API_HOST = 'https://test-giftcard8-api.gcard8.com';
const APP_KEY = 'f55b967cad863f21a385e904dceae165';

export class APIRequest {
  private static generateSignature(params: Record<string, string>): string {
    // Sort parameters alphabetically
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc: Record<string, string>, key: string) => {
        acc[key] = params[key];
        return acc;
      }, {});

    // Create parameter string
    const paramString = Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    // Generate signature
    return md5(paramString + APP_KEY);
  }

  static async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    params: Record<string, string> = {}
  ): Promise<T> {
    // Add default parameters
    const requestParams = {
      ...params,
      appid: 'ios-1.0',
    };

    // Generate signature
    const md5sign = this.generateSignature(requestParams);

    // Construct URL with parameters for GET requests
    const url = new URL(endpoint, API_HOST);
    if (method === 'GET') {
      Object.entries({ ...requestParams, md5sign }).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    try {
      const response = await fetch(url.toString(), {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        ...(method === 'POST' && {
          body: JSON.stringify({ ...requestParams, md5sign }),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.msg || 'API request failed');
      }

      return data as T;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }
}