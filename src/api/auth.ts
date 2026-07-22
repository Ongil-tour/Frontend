import { client } from './client';
import type { LoginPayload, SignupPayload } from '../types/auth';

export const login = (payload: LoginPayload) =>
  client.post('/auth/login', payload).then((r) => r.data);

export const signup = (payload: SignupPayload) =>
  client.post('/auth/signup', payload).then((r) => r.data);
