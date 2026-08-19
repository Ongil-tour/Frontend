import { client } from './client';
import { User, UserSettings, UserSettingsUpdate } from '../types/user';

export const getMyProfile = () => client.get<User>('/users/me').then((r) => r.data);

export const getMySettings = () => client.get<UserSettings>('/users/me/settings').then((r) => r.data);

export const updateMySettings = (payload: UserSettingsUpdate) =>
  client.patch<UserSettings>('/users/me', payload).then((r) => r.data);

export const deleteMyAccount = () => client.delete('/users/me').then((r) => r.data);
