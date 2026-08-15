export type FavoriteListType = 'FREQUENT' | 'WISHLIST' | 'VISITED';

export interface FavoriteList {
  id: string;
  list_type: FavoriteListType;
  created_at: string;
  favorite_count: number;
}

export interface FavoriteItem {
  id: string;
  facility_id: string;
  list_id: string;
  created_at: string;
}

export interface FavoriteStatus {
  is_favorite: boolean;
  favorite_list_ids: string[];
}

export interface CreateFavoritePayload {
  facility_id: string;
  list_id: string;
}
