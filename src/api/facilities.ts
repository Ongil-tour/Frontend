import { client } from './client';
import { FacilityDetail } from '../types/place';

// 즐겨찾기 항목엔 facility_id만 오고 이름/주소/접근성 정보가 없어서 시설 상세 조회가
// 필요하다. 다른 곳에서는 이 함수를 통해서만 시설 상세를 조회한다.
export const getFacilityById = (id: string) =>
  client.get<FacilityDetail>(`/facilities/${id}`).then((r) => r.data);
