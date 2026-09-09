import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateMySettings } from '../api/user';

export function useUpdateMySettingsMutation() {
  const queryClient = useQueryClient();
  // 겹치는 mutate() 호출 중 응답이 늦게 도착한 옛날 요청이 캐시를 덮어쓰지 않도록,
  // 가장 마지막으로 시작된 호출의 응답만 캐시에 반영한다.
  const latestCallId = useRef(0);

  return useMutation({
    mutationFn: updateMySettings,
    onMutate: () => {
      const callId = ++latestCallId.current;
      return { callId };
    },
    onSuccess: (data, _variables, context) => {
      if (context?.callId === latestCallId.current) {
        queryClient.setQueryData(['users', 'me', 'settings'], data);
      }
    },
  });
}
