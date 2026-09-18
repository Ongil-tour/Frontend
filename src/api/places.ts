import { client } from './client';
import { MatchByLocationResponse } from '../types/place';

// POST /facilities/match-by-location — 좌표 반경(m) 내 가장 가까운 시설 1건 매칭
export const matchFacilityByLocation = (params: { lat: number; lng: number; radius?: number }) =>
  client
    .post<MatchByLocationResponse>('/facilities/match-by-location', {
      lat: params.lat,
      lng: params.lng,
      radius: params.radius ?? 50,
    })
    .then((r) => r.data);
