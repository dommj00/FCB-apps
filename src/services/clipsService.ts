import apiClient from './api';
import { Clip, ClipsResponse } from '../types';

class ClipsService {
  async getClips(channel?: string, status?: string, limit: number = 50): Promise<ClipsResponse> {
    try {
      const params: any = { limit };
      if (channel) params.channel = channel;
      if (status) params.status = status;

      const response = await apiClient.get('/api/clips/', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch clips');
    }
  }

  async getClip(clipId: string): Promise<Clip> {
    try {
      const response = await apiClient.get(`/api/clips/${clipId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch clip');
    }
  }

  async deleteClip(clipId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/clips/${clipId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete clip');
    }
  }

  async bulkDelete(clipIds: string[]): Promise<void> {
    try {
      await apiClient.post('/api/clips/bulk-delete', clipIds);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete clips');
    }
  }

  async getDownloadUrl(clipId: string): Promise<string> {
    try {
      const response = await apiClient.get(`/api/clips/${clipId}/download`);
      return response.data.url;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get download URL');
    }
  }

  async getTimelineThumbnails(clipId: string, count: number = 10): Promise<string[]> {
    try {
      const response = await apiClient.get(`/api/clips/${clipId}/thumbnails`, {
        params: { count }
      });
      return response.data.thumbnails || [];
    } catch (error: any) {
      console.log('Timeline thumbnails not available, using fallback');
      return [];
    }
  }
}

export default new ClipsService();
