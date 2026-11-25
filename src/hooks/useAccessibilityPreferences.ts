import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

export function useAccessibilityPreferences() {
  const initialReduceMotion = useReducedMotion();
  const [reduceMotion, setReduceMotion] = useState(initialReduceMotion);
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);

  useEffect(() => {
    let active = true;

    function observe(
      event: 'reduceMotionChanged' | 'screenReaderChanged',
      read: () => Promise<boolean> | undefined,
      update: (enabled: boolean) => void
    ) {
      let changed = false;
      const subscription = AccessibilityInfo.addEventListener?.(event, (enabled) => {
        changed = true;
        if (active) {
          update(enabled);
        }
      });

      async function readInitialPreference() {
        try {
          const enabled = await read();

          if (active && !changed && typeof enabled === 'boolean') {
            update(enabled);
          }
        } catch {
          // Keep the seed when a platform cannot query the current preference.
        }
      }

      readInitialPreference();

      return () => subscription?.remove();
    }

    const removeReduceMotion = observe(
      'reduceMotionChanged',
      () => AccessibilityInfo.isReduceMotionEnabled?.(),
      setReduceMotion
    );
    const removeScreenReader = observe(
      'screenReaderChanged',
      () => AccessibilityInfo.isScreenReaderEnabled?.(),
      setScreenReaderEnabled
    );

    return () => {
      active = false;
      removeReduceMotion();
      removeScreenReader();
    };
  }, []);

  return { reduceMotion, screenReaderEnabled };
}
