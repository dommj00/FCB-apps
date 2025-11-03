import axios from 'axios';
import { config } from '../config';
import { TextOverlayData } from '../components/TextEditorPanel';
import { MemeOverlayData } from '../components/DraggableMemeOverlay';
import { ExportSettings } from '../components/ExportModal';

const api = axios.create({
  baseURL: config.api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '69420',
  },
});

export interface EditClipRequest {
  clip_id: string;
  trim_start?: number;
  trim_end?: number;
  text_overlays: Array<{
    text: string;
    font: string;
    font_size: number;
    color: string;
    background_color?: string;
    has_background: boolean;
    has_outline: boolean;
    outline_color: string;
    has_shadow: boolean;
    alignment: string;
    position_x: number;
    position_y: number;
    start_time: number;
    end_time: number;
  }>;
  meme_overlays: Array<{
    url: string;
    position_x: number;
    position_y: number;
    width: number;
    height: number;
    start_time: number;
    end_time: number;
  }>;
  export_settings: {
    platform: string;
    resolution: string;
    quality: string;
  };
}

export interface EditClipResponse {
  job_id: string;
  status: string;
  message: string;
}

export interface JobStatusResponse {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  download_url?: string;
  error?: string;
}

export const exportEditedClip = async (
  clipId: string,
  trimStart: number,
  trimEnd: number,
  textOverlays: TextOverlayData[],
  memeOverlays: MemeOverlayData[],
  exportSettings: ExportSettings
): Promise<EditClipResponse> => {
  const requestData: EditClipRequest = {
    clip_id: clipId,
    trim_start: trimStart,
    trim_end: trimEnd,
    text_overlays: textOverlays.map(overlay => ({
      text: overlay.text,
      font: overlay.font,
      font_size: overlay.fontSize,
      color: overlay.color,
      background_color: overlay.backgroundColor,
      has_background: overlay.hasBackground,
      has_outline: overlay.hasOutline,
      outline_color: overlay.outlineColor,
      has_shadow: overlay.hasShadow,
      alignment: overlay.alignment,
      position_x: overlay.position.x,
      position_y: overlay.position.y,
      start_time: overlay.startTime,
      end_time: overlay.endTime,
    })),
    meme_overlays: memeOverlays.map(overlay => ({
      url: overlay.url,
      position_x: overlay.position.x,
      position_y: overlay.position.y,
      width: overlay.size.width,
      height: overlay.size.height,
      start_time: overlay.startTime,
      end_time: overlay.endTime,
    })),
    export_settings: {
      platform: exportSettings.platform,
      resolution: exportSettings.resolution,
      quality: exportSettings.quality,
    },
  };

  const response = await api.post('/api/clips/edit', requestData);
  return response.data;
};

export const checkJobStatus = async (jobId: string): Promise<JobStatusResponse> => {
  const response = await api.get(`/api/jobs/${jobId}`);
  return response.data;
};

export default api;
