import { KakaoPlace } from '../types/place';

export type RootStackParamList = {
  Map: undefined;
  PlaceDetail: { place: KakaoPlace };
};
