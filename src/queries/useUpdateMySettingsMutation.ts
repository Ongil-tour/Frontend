import { useMutation } from '@tanstack/react-query';
import { updateMySettings } from '../api/user';

export function useUpdateMySettingsMutation() {
  return useMutation({
    mutationFn: updateMySettings,
  });
}
