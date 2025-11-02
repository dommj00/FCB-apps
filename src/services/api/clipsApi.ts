import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Clip, ClipsResponse } from '../../types';

const API_BASE_URL = 'https://furyclips.ngrok.io';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'FuryClipsMobile/1.0',
    'ngrok-skip-browser-warning': '69420',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class ClipsAPI {
  async getClips(
    channel?: string,
    status?: string,
    limit: number = 50
  ): Promise<ClipsResponse> {
    const params: any = { limit };
    if (channel) params.channel = channel;
    if (status) params.status = status;

    const response = await apiClient.get('/api/clips/', { params });
    return response.data;
  }

  async getClip(clipId: string): Promise<Clip> {
    const response = await apiClient.get(`/api/clips/${clipId}`);
    return response.data;
  }

  async deleteClip(clipId: string): Promise<void> {
    await apiClient.delete(`/api/clips/${clipId}`);
  }

  async getDownloadUrl(clipId: string): Promise<{ url: string }> {
    const response = await apiClient.get(`/api/clips/${clipId}/download`);
    return response.data;
  }
}

export const clipsAPI = new ClipsAPI();
