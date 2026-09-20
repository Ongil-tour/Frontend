export const CATEGORIES = [
  { code: 'FD6', label: '음식점' },
  { code: 'CE7', label: '카페' },
  { code: 'AD5', label: '숙소' },
  { code: 'AT4', label: '관광지' },
] as const;

export type CategoryCode = (typeof CATEGORIES)[number]['code'];
