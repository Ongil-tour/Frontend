// 지도 화면(카테고리 버튼, 반경 필터, 마커 핀)에서 쓰던 초록 톤을 앱 전체 브랜드 컬러로 확장.
// 다크모드는 기존 검정 계열을 그대로 유지하고, 라이트모드에서만 이 팔레트를 사용한다.
export const GREEN = {
  primary: '#22A45D',
  primaryPressed: '#1B8A4D',
  primaryText: '#2E7D4F',
  // 화면 전체 캔버스에 까는 배경. 카드/입력창은 흰색으로 띄워서 대비를 준다.
  screenBg: '#EAF6EE',
  soft: '#E9F7EF',
  softer: '#F3F9F5',
  tint: '#DDF2E3',
  border: '#CFEBD9',
} as const;

export const DARK = {
  background: '#222222',
  card: '#333333',
  innerCard: '#444444',
  border: '#555555',
  text: '#FFFFFF',
  subText: '#BDBDBD',
} as const;
