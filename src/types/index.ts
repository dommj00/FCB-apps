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
  status: 'ready' | 'processing' | 'failed';
  download_url: string;
  thumbnail_path?: string;
  stream_title?: string;
  stream_game?: string;
  file_size?: number;
}

export interface ClipsResponse {
  clips: Clip[];
  total: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface ClipsState {
  items: Clip[];
  selectedClips: string[];
  loading: boolean;
  error: string | null;
}
