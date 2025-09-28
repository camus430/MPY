export interface Creator {
  id: string;
  name: string;
  avatar_url?: string;
  subscriber_count: number;
  description?: string;
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
  creator?: Creator;
}

export interface VideoWithCreator extends Video {
  creator: Creator;
}