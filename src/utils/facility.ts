import { FacilityMatchResult } from '../types/place';
import { KakaoPlace } from '../types/place';

// 즐겨찾기 목록에서 시설 상세(FacilityMatchResult)를 PlaceDetail 화면이 받는 KakaoPlace
// 형태로 변환. source: 'internal'로 표시해서 PlaceDetailScreen이 좌표 재조회 없이
// facility.accessibility를 그대로 쓰게 한다.
export function mapFacilityToKakaoPlace(facility: FacilityMatchResult): KakaoPlace {
  return {
    id: facility.id,
    name: facility.name,
    category: '',
    address: facility.address ?? '',
    phone: facility.phone ?? '',
    lat: facility.lat,
    lng: facility.lng,
    distance: null,
    accessibility: facility.accessibility,
    source: 'internal',
  };
}
