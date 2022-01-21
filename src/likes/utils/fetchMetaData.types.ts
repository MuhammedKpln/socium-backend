export interface IYoutubeMeta {
  title: string;
  author_name: string;
  author_url: string;
  type: string;
  height: number;
  width: number;
  version: string;
  provider_name: string;
  provider_url: string;
  thumbnail_height: number;
  thumbnail_width: number;
  thumbnail_url: string;
  html: string;
}
export interface ITwitterMeta {
  url: string;
  author_name: string;
  author_url: string;
  html: string;
  width: number;
  height?: any;
  type: string;
  cache_age: string;
  provider_name: string;
  provider_url: string;
  version: string;
}
export interface IInstagramMeta {
  version: string;
  title: string;
  author_name: string;
  author_url: string;
  author_id: number;
  media_id: string;
  provider_name: string;
  provider_url: string;
  type: string;
  width: number;
  height?: any;
  html: string;
  thumbnail_url: string;
  thumbnail_width: number;
  thumbnail_height: number;
}

interface Attachments {
  media_keys: string[];
}

interface Datum {
  text: string;
  author_id: string;
  id: string;
  attachments: Attachments;
}

interface Medium {
  media_key: string;
  type: string;
  url: string;
}

interface User {
  profile_image_url: string;
  id: string;
  created_at: Date;
  username: string;
  name: string;
}

interface Includes {
  media: Medium[];
  users: User[];
}

export interface ITwitterPost {
  data: Datum[];
  includes: Includes;
}
