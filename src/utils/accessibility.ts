import { AccessibilityInfo } from '../types/place';

export const ACCESSIBILITY_FIELDS: { key: keyof AccessibilityInfo; icon: string; label: string }[] = [
  { key: 'wheelchairAccessible', icon: '♿', label: '휠체어 접근' },
  { key: 'disabledRestroom', icon: '🚻', label: '장애인 화장실' },
  { key: 'parkingLot', icon: '🅿️', label: '전용 주차장' },
  { key: 'elevator', icon: '🛗', label: '엘리베이터' },
  { key: 'petFriendly', icon: '🐕', label: '보호견 동반' },
  { key: 'nursingRoom', icon: '🍼', label: '수유실' },
];

export function getAvailableAccessibilityIcons(info: AccessibilityInfo | undefined | null): string[] {
  if (!info) return [];
  return ACCESSIBILITY_FIELDS.filter((field) => info[field.key] === true).map((field) => field.icon);
}
