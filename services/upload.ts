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
}