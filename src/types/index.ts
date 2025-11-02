export interface User {
  uid: string;
  email: string;
  displayName?: string;
}

export interface Clip {
  clip_id: string;
  channel: string;
  created_by: string;
  created_at: string;
  duration: number;
  resolution: string;
  direction: string;
  status: string;
  download_url: string;
  thumbnail_path: string;
  stream_title?: string;
  stream_game?: string;
}

export interface ClipsResponse {
  clips: Clip[];
  total: number;
}
