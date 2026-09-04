import { client } from './client';
import { CreateFavoritePayload, FacilitySource, FavoriteItem, FavoriteList, FavoriteStatus } from '../types/favorite';

export const getFavoriteLists = () =>
  client.get<FavoriteList[]>('/favorites/lists').then((r) => r.data);

export const getFavoriteListItems = (listId: string) =>
  client.get<FavoriteItem[]>(`/favorites/lists/${listId}`).then((r) => r.data);

export const addFavorite = (payload: CreateFavoritePayload) =>
  client.post<FavoriteItem>('/favorites', payload).then((r) => r.data);

export const removeFavorite = (favoriteId: string) =>
  client.delete(`/favorites/${favoriteId}`).then((r) => r.data);

export const getFavoriteStatus = (facilityId: string, source: FacilitySource = 'internal') =>
  client
    .get<FavoriteStatus>('/favorites/status', { params: { facility_id: facilityId, source } })
    .then((r) => r.data);

// 특정 목록에 저장된 항목을 전부 삭제한다. 목록(FavoriteList) 자체는 남고 항목만 비워진다.
export const clearFavoriteList = (listId: string) =>
  client.delete(`/favorites/lists/${listId}`).then((r) => r.data);
