import { useIsFocused } from 'expo-router/react-navigation';
import type { ReactNode } from 'react';

// Native stacks retain earlier routes. Hidden workloads must release their hooks.
export function FocusedScene({ children }: { children: ReactNode }) {
  const focused = useIsFocused();

  return focused ? children : null;
}
