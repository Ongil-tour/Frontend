// app/models/facility.py Facility 모델 기준 (2026-08-02 공유분)
export interface AccessibilityInfo {
  wheelchair_accessible: boolean | null;
  disabled_restroom: boolean | null;
  disabled_parking: boolean | null;
  elevator: boolean | null;
  pet_friendly: boolean | null;
  nursing_room: boolean | null;
}

// POST /facilities/match-by-location 응답의 facility 필드.
// app/schemas/facility.py의 FacilityMatchResult 원문은 못 봐서, Facility 모델과
// map.py의 _internal_to_unified 매핑 기준으로 추정 — 실제 응답과 다르면 여기만 고치면 됨
export interface FacilityMatchResult extends AccessibilityInfo {
  id: string;
  name: string;
  category: string | null;
  address: string | null;
  phone: string | null;
  operating_hours: string | null;
  lat: number;
  lng: number;
}

export interface MatchByLocationResponse {
  matched: boolean;
  facility?: FacilityMatchResult;
  message?: string;
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
}
