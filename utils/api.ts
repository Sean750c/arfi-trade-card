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
    try {
      // Add default parameters
      const requestParams = {
        ...params,
        appid: 'web-v1',
      };
  
      // Generate signature
      const sign = this.generateSignature(requestParams);
      
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded' 
      };

      // 准备请求体 - 关键修改点2
      const requestBody = {
        ...requestParams,
        sign
      };
      
      const requestOptions: RequestInit = {
        method,
        headers, // 直接使用对象，不是 Headers 实例
        body: new URLSearchParams(requestBody).toString() // 转换为 URLSearchParams 并转换为字符串
      };
      console.log('Request options:', requestOptions); // 调试用
      const response = await fetch(`${API_HOST}${endpoint}`, requestOptions);
      console.log('Reponse data:', response); // 调试用
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