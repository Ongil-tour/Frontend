import { client } from './client';
import { User, UserSettings, UserSettingsUpdate } from '../types/user';

export const getMyProfile = () => client.get<User>('/users/me').then((r) => r.data);

// 백엔드에 설정 조회 GET이 따로 없어서, PATCH 응답으로만 최신 설정값을 받을 수 있다.
export const updateMySettings = (payload: UserSettingsUpdate) =>
  client.patch<UserSettings>('/users/me', payload).then((r) => r.data);
