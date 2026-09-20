import { KakaoPlace } from '../types/place';

export type RootStackParamList = {
  Login: undefined;
  Map: undefined;
  PlaceDetail: { place: KakaoPlace };
  PlaceStorage: undefined;
  MyPage: undefined;
  Setting: undefined;
};
