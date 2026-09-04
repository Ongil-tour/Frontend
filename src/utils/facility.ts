import { AccessibilityInfo, FacilityDetail, KakaoPlace } from '../types/place';

// GET /facilities/{id}(FacilityDetail)의 평평한 snake_case 접근성 필드를
// AccessibilityInfo(camelCase 중첩) 형태로 변환.
export function facilityToAccessibilityInfo(facility: FacilityDetail): AccessibilityInfo {
  return {
    wheelchairAccessible: facility.wheelchair_accessible,
    disabledRestroom: facility.disabled_restroom,
    parkingLot: facility.disabled_parking,
    elevator: facility.elevator,
    petFriendly: facility.pet_friendly,
    nursingRoom: facility.nursing_room,
  };
}

// 즐겨찾기 목록에서 시설 상세(FacilityDetail)를 PlaceDetail 화면이 받는 KakaoPlace
// 형태로 변환. source: 'internal'로 표시해서 PlaceDetailScreen이 좌표 재조회 없이
// facility.accessibility를 그대로 쓰게 한다.
export function mapFacilityToKakaoPlace(facility: FacilityDetail): KakaoPlace {
  return {
    id: facility.id,
    name: facility.name,
    category: facility.category ?? '',
    address: facility.address ?? '',
    phone: facility.phone ?? '',
    lat: facility.lat,
    lng: facility.lng,
    distance: null,
    accessibility: facilityToAccessibilityInfo(facility),
    source: 'internal',
  };
}
