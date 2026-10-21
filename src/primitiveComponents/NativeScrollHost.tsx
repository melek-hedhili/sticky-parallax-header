import * as React from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import type { ScrollViewProps } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import type { Gesture } from 'react-native-gesture-handler';

import type { ScrollViewRef } from './ScrollComponent';

type NativeScrollGesture = ReturnType<typeof Gesture.Native> | null;
const NativeScrollContext = React.createContext<NativeScrollGesture>(null);

export const NativeScrollProvider: React.Provider<NativeScrollGesture> =
  NativeScrollContext.Provider;

/** Opaque refresh roots retain native ownership rather than receiving a second handler. */
export function hasSupportedRefreshControl(refreshControl: unknown): boolean {
  return (
    !refreshControl ||
    (React.isValidElement(refreshControl) && refreshControl.type === RefreshControl)
  );
}

/** FlashList has a container before its scroll host; attach inside its supported adapter. */
export const HeaderScrollView = React.forwardRef<ScrollViewRef, ScrollViewProps>((props, ref) => {
  const nativeGesture = React.useContext(NativeScrollContext);
  const scrollable = <ScrollView {...props} ref={ref} />;

  return nativeGesture && hasSupportedRefreshControl(props.refreshControl) ? (
    <GestureDetector gesture={nativeGesture}>{scrollable}</GestureDetector>
  ) : (
    scrollable
  );
});
