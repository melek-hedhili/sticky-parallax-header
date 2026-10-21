import { act, fireEvent, render, renderHook, screen } from '@testing-library/react-native';
import * as React from 'react';
import { Dimensions, Platform, Text } from 'react-native';
import type { AnimatedRef, SharedValue } from 'react-native-reanimated';
import * as Reanimated from 'react-native-reanimated';
import * as Worklets from 'react-native-worklets';

import {
  createAnimatedRef,
  installAnimationHarness,
  scrollEvent,
} from '../__fixtures__/animationHarness';
import type { PagerMethods } from '../predefinedComponents/TabbedHeader/TabbedHeaderProps';
import { Pager } from '../predefinedComponents/TabbedHeader/components/Pager';
import { Tabs } from '../predefinedComponents/TabbedHeader/components/Tabs';
import { useTabbedHeaderList } from '../predefinedComponents/TabbedHeader/hooks/useTabbedHeader';
import { ElasticHeaderProvider } from '../primitiveComponents/ElasticHeaderContext';
import type { ScrollViewRef, SectionListRef } from '../primitiveComponents/ScrollComponent';

beforeEach(() => {
  jest.replaceProperty(Platform, 'OS', 'ios');
});
afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

// Model this pager's single delayed restoration and cancellation. Actual native
// animation frames and gesture arbitration are covered by mobile validation.
function deferPagerRestoration() {
  let pending: { timer: ReturnType<typeof setTimeout>; cancel: () => void } | undefined;

  jest.spyOn(Reanimated, 'withTiming').mockImplementation((value, _config, callback) => {
    pending = {
      timer: setTimeout(() => {
        pending = undefined;
        callback?.(true, value);
      }, 250),
      cancel: () => callback?.(false, value),
    };

    return value;
  });
  jest.spyOn(Reanimated, 'withDelay').mockImplementation((_delay, animation) => animation);
  jest.spyOn(Reanimated, 'cancelAnimation').mockImplementation(() => {
    if (pending) {
      clearTimeout(pending.timer);
      pending.cancel();
      pending = undefined;
    }
  });
}

test('imperative page changes remember each page scroll position and use the requested page', async () => {
  const { scrollTo } = installAnimationHarness();
  const ref = React.createRef<PagerMethods>();
  const scrollRef = createAnimatedRef<ScrollViewRef>() as AnimatedRef<ScrollViewRef>;
  const scrollValue = { value: 120 } as SharedValue<number>;
  const onChangeTab = jest.fn();

  await render(
    <Pager
      ref={ref}
      page={-1}
      minScrollHeight={300}
      scrollHeight={400}
      scrollRef={scrollRef}
      scrollValue={scrollValue}
      rememberTabScrollPosition
      onChangeTab={onChangeTab}>
      <Text>First page</Text>
      <Text>Second page</Text>
    </Pager>
  );
  await act(() => ref.current?.goToPage(1));
  expect(onChangeTab).toHaveBeenLastCalledWith(0, 1);
  expect(scrollTo).toHaveBeenCalledWith(scrollRef, 0, 400, true);
  scrollValue.value = 220;
  scrollTo.mockClear();
  await act(() => ref.current?.goToPage(0));
  expect(onChangeTab).toHaveBeenLastCalledWith(1, 0);
  expect(scrollTo).toHaveBeenCalledWith(scrollRef, 0, 120, true);
  await act(() => ref.current?.goToPage(1));
  expect(scrollTo).toHaveBeenCalledWith(scrollRef, 0, 220, true);
  const calls = onChangeTab.mock.calls.length;

  await act(() => ref.current?.goToPage(-1));
  await act(() => ref.current?.goToPage(2));
  expect(onChangeTab).toHaveBeenCalledTimes(calls);
});

test('page changes discard pull offsets and restore the remembered semantic top', async () => {
  const { scrollTo } = installAnimationHarness();
  const scheduleOnUI = jest.spyOn(Worklets, 'scheduleOnUI');
  const ref = React.createRef<PagerMethods>();
  const scrollRef = createAnimatedRef<ScrollViewRef>() as AnimatedRef<ScrollViewRef>;
  const scrollValue = { value: -80 } as SharedValue<number>;
  const displacement = { value: 80 } as SharedValue<number>;
  const reset = jest.fn(() => {
    displacement.value = 0;
  });

  await render(
    <ElasticHeaderProvider value={{ displacement, reset }}>
      <Pager
        ref={ref}
        page={-1}
        minScrollHeight={300}
        scrollHeight={400}
        scrollRef={scrollRef}
        scrollValue={scrollValue}
        rememberTabScrollPosition>
        <Text>First</Text>
        <Text>Second</Text>
      </Pager>
    </ElasticHeaderProvider>
  );
  await act(() => ref.current?.goToPage(1));
  expect(scheduleOnUI).toHaveBeenCalledWith(reset);
  expect(displacement.value).toBe(0);
  expect(scrollTo).not.toHaveBeenCalledWith(scrollRef, 0, expect.any(Number), true);

  scrollValue.value = 220;
  await act(() => ref.current?.goToPage(0));
  expect(scrollTo).toHaveBeenCalledWith(scrollRef, 0, 0, true);
  expect(scrollTo).not.toHaveBeenCalledWith(scrollRef, 0, -80, true);
  expect(reset).toHaveBeenCalledTimes(2);
});

test('rapid page changes cancel the previous delayed restoration and apply only the latest target', async () => {
  jest.useFakeTimers();
  const { scrollTo } = installAnimationHarness();

  deferPagerRestoration();
  const ref = React.createRef<PagerMethods>();
  const scrollRef = createAnimatedRef<ScrollViewRef>() as AnimatedRef<ScrollViewRef>;
  const scrollValue = { value: 120 } as SharedValue<number>;

  await render(
    <Pager
      ref={ref}
      page={-1}
      minScrollHeight={300}
      scrollHeight={400}
      scrollRef={scrollRef}
      scrollValue={scrollValue}
      rememberTabScrollPosition>
      <Text>First</Text>
      <Text>Second</Text>
    </Pager>
  );
  await act(() => ref.current?.goToPage(1));
  await act(() => jest.advanceTimersByTime(100));
  scrollValue.value = 220;
  await act(() => ref.current?.goToPage(0));
  await act(() => jest.advanceTimersByTime(250));

  expect(scrollTo).toHaveBeenCalledWith(scrollRef, 0, 120, true);
  expect(scrollTo).not.toHaveBeenCalledWith(scrollRef, 0, 400, true);
  expect(scrollTo.mock.calls.filter(([target]) => Object.is(target, scrollRef))).toHaveLength(1);
});

test.each(['pull at the top', 'restoration disabled'] as const)(
  'a native page change cancels stale restoration even with %s',
  async (condition) => {
    jest.useFakeTimers();
    const harness = installAnimationHarness();

    deferPagerRestoration();
    const ref = React.createRef<PagerMethods>();
    const scrollRef = createAnimatedRef<ScrollViewRef>() as AnimatedRef<ScrollViewRef>;
    const scrollValue = { value: 120 } as SharedValue<number>;
    const reset = jest.fn();
    const props = {
      ref,
      page: -1,
      minScrollHeight: 300,
      scrollHeight: 400,
      scrollRef,
      scrollValue,
    };
    const pages = [<Text key="first">First</Text>, <Text key="second">Second</Text>];
    const providerValue = { displacement: { value: 0 } as SharedValue<number>, reset };

    await render(
      <ElasticHeaderProvider value={providerValue}>
        <Pager {...props}>{pages}</Pager>
      </ElasticHeaderProvider>
    );
    await act(() => ref.current?.goToPage(1));
    await act(() => jest.advanceTimersByTime(100));
    if (condition === 'pull at the top') {
      scrollValue.value = -80;
    } else {
      await screen.rerender(
        <ElasticHeaderProvider value={providerValue}>
          <Pager {...props} disableScrollToPosition>
            {pages}
          </Pager>
        </ElasticHeaderProvider>
      );
    }

    await act(() => harness.scrollHandlers[0].current.onMomentumEnd?.(scrollEvent(0, 0, 0)));
    await act(() => jest.advanceTimersByTime(500));

    expect(harness.scrollTo).not.toHaveBeenCalledWith(scrollRef, 0, expect.any(Number), true);
    expect(reset).toHaveBeenCalledTimes(2);
  }
);

test('a native swipe updates the page used by the next imperative navigation', async () => {
  const harness = installAnimationHarness();
  const ref = React.createRef<PagerMethods>();
  const onChangeTab = jest.fn();
  const swipedPage = jest.fn();

  await render(
    <Pager
      ref={ref}
      page={-1}
      minScrollHeight={300}
      scrollHeight={400}
      scrollRef={createAnimatedRef<ScrollViewRef>() as AnimatedRef<ScrollViewRef>}
      scrollValue={{ value: 0 } as SharedValue<number>}
      onChangeTab={onChangeTab}
      swipedPage={swipedPage}>
      <Text>First page</Text>
      <Text>Second page</Text>
    </Pager>
  );
  await act(() =>
    harness.scrollHandlers[0].current.onMomentumEnd?.(
      scrollEvent(0, 0, Dimensions.get('window').width)
    )
  );
  expect(swipedPage).toHaveBeenCalledWith(1);
  expect(onChangeTab).toHaveBeenLastCalledWith(0, 1);
  await act(() => ref.current?.goToPage(0));
  expect(onChangeTab).toHaveBeenLastCalledWith(1, 0);
});

test('restoration can be disabled after mount', async () => {
  const { scrollTo } = installAnimationHarness();
  const ref = React.createRef<PagerMethods>();
  const scrollRef = createAnimatedRef<ScrollViewRef>() as AnimatedRef<ScrollViewRef>;
  const scrollValue = { value: 120 } as SharedValue<number>;
  const props = { ref, page: -1, minScrollHeight: 300, scrollHeight: 400, scrollRef, scrollValue };

  await render(
    <Pager {...props}>
      <Text>First</Text>
      <Text>Second</Text>
    </Pager>
  );
  await screen.rerender(
    <Pager {...props} disableScrollToPosition>
      <Text>First</Text>
      <Text>Second</Text>
    </Pager>
  );
  await act(() => ref.current?.goToPage(1));
  expect(scrollTo).not.toHaveBeenCalledWith(scrollRef, 0, expect.any(Number), true);
});

test('web paging debounces scroll completion and cancels pending callbacks on unmount', async () => {
  jest.useFakeTimers();
  jest.replaceProperty(Platform, 'OS', 'web');
  const harness = installAnimationHarness();
  const onChangeTab = jest.fn();
  const props = {
    page: -1,
    minScrollHeight: 300,
    scrollHeight: 400,
    scrollRef: createAnimatedRef<ScrollViewRef>() as AnimatedRef<ScrollViewRef>,
    scrollValue: { value: 0 } as SharedValue<number>,
    onChangeTab,
  };

  await render(
    <Pager {...props}>
      <Text>First</Text>
      <Text>Second</Text>
    </Pager>
  );
  await act(() =>
    harness.scrollHandlers[0].current.onScroll?.(scrollEvent(0, 0, Dimensions.get('window').width))
  );
  expect(onChangeTab).not.toHaveBeenCalled();
  await act(() => {
    jest.advanceTimersByTime(50);
    harness.scrollHandlers[0].current.onScroll?.(
      scrollEvent(0, 0, Dimensions.get('window').width * 1.1)
    );
    jest.advanceTimersByTime(99);
  });
  expect(onChangeTab).not.toHaveBeenCalled();
  await act(() => jest.advanceTimersByTime(1));
  expect(onChangeTab).toHaveBeenLastCalledWith(0, 1);
  await act(() => harness.scrollHandlers[0].current.onScroll?.(scrollEvent(0, 0, 0)));
  await screen.unmount();
  await act(() => {
    jest.advanceTimersByTime(100);
  });
  expect(onChangeTab).toHaveBeenCalledTimes(1);
});

test('tab presses and section viewability cooperate without overriding programmatic selection', async () => {
  installAnimationHarness();
  const sections = [
    { key: 'first', data: ['one'] },
    { key: 'second', data: ['two'] },
  ];
  const scrollToLocation = jest.fn();
  const hook = await renderHook(() =>
    useTabbedHeaderList({ sections, tabs: [{ title: 'First' }, { title: 'Second' }] })
  );

  hook.result.current.scrollViewRef.current = { scrollToLocation } as unknown as SectionListRef<
    string,
    (typeof sections)[number]
  >;
  await act(() => hook.result.current.goToSection(1));
  expect(scrollToLocation).toHaveBeenCalledWith({
    animated: true,
    itemIndex: 1,
    sectionIndex: 1,
    viewPosition: 0,
  });
  const firstVisible = {
    viewableItems: [{ item: 'one', index: 0, isViewable: true, key: 'one', section: sections[0] }],
    changed: [],
  };

  await act(() => hook.result.current.onViewableItemsChanged(firstVisible));
  expect(hook.result.current.renderTabs()?.props.activeTab).toBe(1);
  await act(() => hook.result.current.onMomentumScrollEnd(scrollEvent(0)));
  await act(() => hook.result.current.onViewableItemsChanged(firstVisible));
  expect(hook.result.current.renderTabs()?.props.activeTab).toBe(0);
});

test('tabs expose pressable labels and select the pressed index', async () => {
  installAnimationHarness();
  const onTabPressed = jest.fn();

  await render(
    <Tabs
      tabs={[{ title: 'First' }, { title: 'Second' }]}
      activeTab={0}
      horizontalScrollValue={{ value: 0 } as SharedValue<number>}
      onTabPressed={onTabPressed}
    />
  );
  await fireEvent.press(screen.getByRole('button', { name: 'Second' }));
  expect(onTabPressed).toHaveBeenCalledWith(1);
});
