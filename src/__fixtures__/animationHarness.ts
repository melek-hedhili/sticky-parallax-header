import * as React from 'react';
import type { NativeScrollEvent } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import * as Reanimated from 'react-native-reanimated';
import * as Worklets from 'react-native-worklets';

type ScrollHandlers = Partial<
  Record<
    'onScroll' | 'onBeginDrag' | 'onEndDrag' | 'onMomentumBegin' | 'onMomentumEnd',
    (event: NativeScrollEvent) => void
  >
>;
type Reaction = {
  prepare: () => unknown;
  react: (value: unknown, previous: unknown) => void;
  initialized: boolean;
  previous: unknown;
};

interface AnimationHarnessOptions {
  deferRNScheduling?: boolean;
}

export function createAnimatedRef<T>() {
  const ref = Object.assign(
    (instance: T | null) => {
      ref.current = instance;
    },
    { current: null as T | null }
  );

  return ref;
}

/**
 * Models direct scalar scroll-value reactions and RN callback delivery. Raw value
 * equality follows the shared-value setter's === check. This does not model
 * arbitrary prepared objects, native mapper dependencies, commits, or timing.
 */
export function installAnimationHarness({
  deferRNScheduling = false,
}: AnimationHarnessOptions = {}) {
  const scrollHandlers: { current: ScrollHandlers }[] = [];
  const reactions = new Set<Reaction>();
  const rnQueue: (() => void)[] = [];
  const rnScheduler = jest
    .spyOn(Worklets, 'scheduleOnRN')
    .mockImplementation((callback, ...args) => {
      const deliver = () => {
        if (typeof callback !== 'function') {
          throw new Error('The animation harness expects an RN callback function.');
        }

        callback(...args);
      };

      if (deferRNScheduling) {
        rnQueue.push(deliver);
      } else {
        deliver();
      }
    });

  jest.spyOn(Reanimated, 'useSharedValue').mockImplementation(function useSharedValue<T>(
    initial: T
  ) {
    return React.useRef({ value: initial }).current as SharedValue<T>;
  });
  jest.spyOn(Reanimated, 'useAnimatedRef').mockImplementation(function useAnimatedRef() {
    return React.useRef(createAnimatedRef()).current as ReturnType<
      typeof Reanimated.useAnimatedRef
    >;
  });
  jest
    .spyOn(Reanimated, 'useAnimatedReaction')
    .mockImplementation(function useAnimatedReaction(prepare, react) {
      const reaction = React.useRef<Reaction>({
        prepare,
        react,
        initialized: false,
        previous: null,
      });

      reaction.current.prepare = prepare;
      reaction.current.react = react;
      React.useEffect(() => {
        const current = reaction.current as Reaction;

        reactions.add(current);

        return () => {
          reactions.delete(current);
        };
      }, []);
    });
  jest
    .spyOn(Reanimated, 'useAnimatedScrollHandler')
    .mockImplementation(function useAnimatedScrollHandler(handlers) {
      const latest = React.useRef(handlers);

      latest.current = handlers;
      React.useEffect(() => {
        scrollHandlers.push(latest as { current: ScrollHandlers });
      }, []);

      return React.useCallback((event: NativeScrollEvent | { nativeEvent: NativeScrollEvent }) => {
        const nativeEvent = 'nativeEvent' in event ? event.nativeEvent : event;

        if (typeof latest.current === 'function') {
          latest.current({ ...nativeEvent, eventName: 'onScroll' }, {});
        } else {
          latest.current.onScroll?.({ ...nativeEvent, eventName: 'onScroll' }, {});
        }
      }, []) as unknown as ReturnType<typeof Reanimated.useAnimatedScrollHandler>;
    });
  const scrollTo = jest.spyOn(Reanimated, 'scrollTo').mockImplementation(() => undefined);

  return {
    scrollTo,
    scrollHandlers,
    rnScheduler,
    pendingRNJobs: () => rnQueue.length,
    flushRNQueue: (limit = Infinity) => {
      let delivered = 0;

      while (rnQueue.length && delivered < limit) {
        rnQueue.shift()?.();
        delivered += 1;
      }
    },
    reactToSharedValues: () => {
      for (const reaction of reactions) {
        const value = reaction.prepare();

        if (reaction.initialized && value === reaction.previous) {
          continue;
        }

        reaction.react(value, reaction.initialized ? reaction.previous : null);
        reaction.previous = value;
        reaction.initialized = true;
      }
    },
  };
}

export function scrollEvent(y: number, velocity = 0, x = 0): NativeScrollEvent {
  return {
    contentOffset: { x, y },
    contentInset: { top: 0, bottom: 0, left: 0, right: 0 },
    contentSize: { width: 300, height: 2000 },
    layoutMeasurement: { width: 300, height: 600 },
    velocity: { x: 0, y: velocity },
    zoomScale: 1,
  };
}
