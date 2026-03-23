const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Something went wrong' };
      }

      return { data };
    } catch (error) {
      return { error: 'Network error' };
    }
  }

  // Auth
  async getCurrentUser() {
    return this.request<any>('/auth/me');
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // Wallpapers
  async getWallpapers(params: {
    page?: number;
    limit?: number;
    sort?: string;
    tags?: string[];
    search?: string;
    resolution?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    return this.request<any>(`/wallpapers?${searchParams}`);
  }

  async getWallpaper(id: string) {
    return this.request<any>(`/wallpapers/${id}`);
  }

  async saveGeneratedWallpaper(wallpaperData: {
    title?: string;
    description?: string;
    imageDataUrl: string;
    generationParams: any;
    tags?: string[];
  }) {
    return this.request<any>('/wallpapers', {
      method: 'POST',
      body: JSON.stringify(wallpaperData),
    });
  }

  async deleteWallpaper(id: string) {
    return this.request(`/wallpapers/${id}`, { method: 'DELETE' });
  }

  // Voting
  async voteOnWallpaper(id: string, voteType: number) {
    return this.request<any>(`/wallpapers/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType }),
    });
  }

  async getWallpaperVotes(id: string) {
    return this.request<any>(`/wallpapers/${id}/votes`);
  }

  // Users
  async getUser(username: string, page = 1) {
    return this.request<any>(`/users/${username}?page=${page}`);
  }

  async getUserCollections(username: string) {
    return this.request<any>(`/users/${username}/collections`);
  }

  // Collections
  async createCollection(data: { name: string; description?: string; isPublic?: boolean }) {
    return this.request<any>('/collections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCollection(id: string, page = 1) {
    return this.request<any>(`/collections/${id}?page=${page}`);
  }

  async addToCollection(collectionId: string, wallpaperId: string) {
    return this.request<any>(`/collections/${collectionId}/items`, {
      method: 'POST',
      body: JSON.stringify({ wallpaperId }),
    });
  }

  async removeFromCollection(collectionId: string, wallpaperId: string) {
    return this.request(`/collections/${collectionId}/items/${wallpaperId}`, {
      method: 'DELETE',
    });
  }

  async deleteCollection(id: string) {
    return this.request(`/collections/${id}`, { method: 'DELETE' });
  }
}

export const api = new ApiService();
