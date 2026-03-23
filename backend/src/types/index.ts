export { AuthenticatedRequest } from '../middleware/auth';

export interface WallpaperGenerationParams {
  version: number;
  lineNumber: number;
  width: number;
  height: number;
  seed: number;
  anchorpoints: number;
  jitterX: number;
  jitterY: number;
  colorspread: number;
  initialAmplitude: number;
  wipeOnRender: boolean;
  randomColor: boolean;
  color: { r: number; g: number; b: number };
  invcolor: { r: number; g: number; b: number };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TrendingWallpaper {
  id: string;
  title?: string;
  imageUrl: string;
  voteScore: number;
  viewCount: number;
  createdAt: Date;
  creator?: {
    username: string;
    avatarUrl?: string;
  };
}
