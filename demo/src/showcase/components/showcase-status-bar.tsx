import { useIsFocused } from 'expo-router/react-navigation';
import { StatusBar } from 'react-native';
import type { StatusBarProps } from 'react-native';

export function ShowcaseStatusBar(props: StatusBarProps) {
  const focused = useIsFocused();

  return focused ? <StatusBar {...props} /> : null;
}
