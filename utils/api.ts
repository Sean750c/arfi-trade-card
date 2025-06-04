import md5 from 'md5';

const API_HOST = 'https://test-giftcard8-api.gcard8.com';
const APP_KEY = 'f55b967cad863f21a385e904dceae165';

export class APIRequest {
  private static generateSignature(params: Record<string, string>): string {
    // 1. 移除sign参数（如果存在）
    const { sign, ...filteredParams } = params;
    
    // 2. 保持参数原始顺序（与服务器一致）
    const paramString = Object.entries(filteredParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    const signString = paramString + APP_KEY;
    console.log('signString:', signString); // 调试用
    // 3. 添加APP_KEY并生成MD5（确保与服务器的$appkey相同）
    return md5(signString);
}

  static async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    params: Record<string, any> = {}
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
    
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.msg || 'API request failed');
      }
      console.log('Reponse data:', data); // 调试用

      return data as T;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }
}