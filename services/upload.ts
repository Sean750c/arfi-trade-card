import { APIRequest } from '@/utils/api';

export interface UploadUrl {
  objectName: string;
  url: string;
}

export interface UploadUrlsResponse {
  success: boolean;
  code: string;
  msg: string;
  data: UploadUrl[];
}

export interface UploadUrlsRequest {
  token: string;
  image_count?: number;
}

export class UploadService {
  static async getUploadUrls(params: UploadUrlsRequest): Promise<UploadUrl[]> {
    try {
      const response = await APIRequest.request<UploadUrlsResponse>(
        '/gc/order/obsUrls',
        'POST',
        {
          ...params,
          image_count: params.image_count || 5,
        }
      );

      if (!response.success) {
        throw new Error(response.msg || 'Failed to get upload URLs');
      }

      return response.data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error;
      }
      
      if (error instanceof Error) {
        throw new Error(`Failed to get upload URLs: ${error.message}`);
      }
      throw new Error('Failed to get upload URLs');
    }
  }

  static async uploadImageToGoogleStorage(
    uploadUrl: string,
    imageUri: string,
    onProgress?: (progress: number) => void
  ): Promise<String> {
    try {
      // Convert image URI to blob for upload
      const response = await fetch(imageUri);
      const blob = await response.blob();

      //console.log('url：',uploadUrl);
      // Upload to Google Storage using the signed URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': 'image/jpeg',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed with status: ${uploadResponse.status}`);
      }
      return uploadUrl.split("?")[0];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to upload image: ${error.message}`);
      }
      throw new Error('Failed to upload image');
    }
  }

  static async uploadImage(
    uploadUrl: string,
    imageUri: string,
    onProgress?: (progress: number) => void,
    maxRetries = 3
  ): Promise<string> {
    // Helper: sleep for retry backoff
    const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
  
    // Convert image URI to ArrayBuffer
    const getArrayBuffer = async () => {
      const response = await fetch(imageUri);
      return await response.arrayBuffer();
    };
  
    const buffer = await getArrayBuffer();
    const fileSize = buffer.byteLength;
    const chunkSize = 1024 * 1024 * 2; // 2MB per chunk
  
    let offset = 0;
  
    while (offset < fileSize) {
      const end = Math.min(offset + chunkSize, fileSize);
      const chunk = buffer.slice(offset, end);
  
      let attempt = 0;
      let uploaded = false;
  
      while (!uploaded && attempt < maxRetries) {
        try {
          const res = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': 'image/jpeg',
              'Content-Range': `bytes ${offset}-${end - 1}/${fileSize}`,
            },
            body: chunk,
          });
  
          if (!res.ok) throw new Error(`Status ${res.status}`);
  
          uploaded = true;
          if (onProgress) onProgress(Math.min(1, end / fileSize));
        } catch (err) {
          attempt++;
          if (attempt >= maxRetries) throw new Error(`Chunk upload failed: ${err}`);
          await sleep(500 * attempt); // exponential backoff
        }
      }
  
      offset = end;
    }
  
    return uploadUrl.split('?')[0];
  }
}