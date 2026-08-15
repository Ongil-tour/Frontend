import { client } from './client';
import { CreateFavoritePayload, FavoriteItem, FavoriteList, FavoriteStatus } from '../types/favorite';

export const getFavoriteLists = () =>
  client.get<FavoriteList[]>('/favorites/lists').then((r) => r.data);

export const getFavoriteListItems = (listId: string) =>
  client.get<FavoriteItem[]>(`/favorites/lists/${listId}`).then((r) => r.data);

export const addFavorite = (payload: CreateFavoritePayload) =>
  client.post<FavoriteItem>('/favorites', payload).then((r) => r.data);

export const removeFavorite = (favoriteId: string) =>
  client.delete(`/favorites/${favoriteId}`).then((r) => r.data);

export const getFavoriteStatus = (facilityId: string) =>
  client.get<FavoriteStatus>(`/favorites/${facilityId}/status`).then((r) => r.data);
