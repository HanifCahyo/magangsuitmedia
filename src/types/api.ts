export interface ApiPost {
  id: number;
  slug: string;
  title: string;
  content: string;
  published_at: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  small_image: Array<{
    id: number;
    mime: string;
    file_name: string;
    url: string;
  }>;
  medium_image: Array<{
    id: number;
    mime: string;
    file_name: string;
    url: string;
  }>;
}

export interface ApiLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface ApiMeta {
  current_page: number;
  from: number;
  last_page: number;
  path: string;
  per_page: number;
  to: number;
  total: number;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
}

export interface ApiResponse {
  data: ApiPost[];
  links: ApiLinks;
  meta: ApiMeta;
}

export interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  publishedAt: Date;
  image: string;
  mediumImage: string;
}
