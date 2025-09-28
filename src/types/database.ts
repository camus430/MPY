export interface Creator {
  id: string;
  name: string;
  avatar_url: string | null;
  subscriber_count: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  title: string;
  thumbnail_url: string;
  duration: string;
  view_count: number;
  creator_id: string;
  created_at: string;
  updated_at: string;
  // Nouveaux champs pour les fichiers locaux
  video_file_url?: string | null;
  audio_file_url?: string | null;
  file_type?: 'youtube' | 'video' | 'audio';
  file_size?: number | null;
  creator?: Creator; // Pour les jointures
}

export interface VideoWithCreator extends Video {
  creator: Creator;
}