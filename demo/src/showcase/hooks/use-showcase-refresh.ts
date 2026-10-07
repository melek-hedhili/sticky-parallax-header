import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

export function useShowcaseRefresh() {
  const [refreshing, setRefreshing] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        setRefreshing(false);
      };
    }, [])
  );

  const onRefresh = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setRefreshing(true);
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      setRefreshing(false);
    }, 2000);
  }, []);

  return { refreshing, onRefresh };
}
