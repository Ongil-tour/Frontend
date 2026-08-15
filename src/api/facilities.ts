import { client } from './client';
import { FacilityMatchResult } from '../types/place';

// 즐겨찾기 항목엔 facility_id만 오고 이름/주소/접근성 정보가 없어서 시설 상세 조회가
// 필요한데, 정확한 경로가 아직 미확인이라 GET /facilities/{id}로 가정하고 작성함.
// 실제 경로/응답 형태가 다르면 이 파일만 고치면 되도록 다른 곳에서는 이 함수를 통해서만
// 시설 상세를 조회한다.
export const getFacilityById = (id: string) =>
  client.get<FacilityMatchResult>(`/facilities/${id}`).then((r) => r.data);
