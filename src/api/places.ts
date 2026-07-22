import { client } from './client';

export const getPlaces = (params: { category?: string; distance?: number }) =>
  client.get('/places', { params }).then((r) => r.data);

export const getPlaceDetail = (id: string) =>
  client.get(`/places/${id}`).then((r) => r.data);
