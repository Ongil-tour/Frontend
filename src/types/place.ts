// POST /facilities/match-by-location 실제 응답 기준 (2026-08-05 캡처, camelCase + 중첩 구조 확인됨)
export interface AccessibilityInfo {
  wheelchairAccessible: boolean | null;
  disabledRestroom: boolean | null;
  parkingLot: boolean | null;
  elevator: boolean | null;
  petFriendly: boolean | null;
  nursingRoom: boolean | null;
}

// POST /facilities/match-by-location 응답의 facility 필드.
// category 필드는 응답에 없음. accessibility는 별도 중첩 객체로 옴 (facility.accessibility.xxx)
export interface FacilityMatchResult {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  operatingHours: string | null;
  lat: number;
  lng: number;
  accessibility: AccessibilityInfo;
}

export interface MatchByLocationResponse {
  matched: boolean;
  facility?: FacilityMatchResult;
  message?: string | null;
}

export interface Place {
  id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  distance?: number;
  accessibility: AccessibilityInfo;
}

export interface KakaoPlace {
  id: string | null;
  name: string;
  category: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  distance: number | null;
  // 백엔드(/map/markers) 결과에만 존재. 카카오 키워드 검색 결과 등에는 없음
  accessibility?: AccessibilityInfo;
}
