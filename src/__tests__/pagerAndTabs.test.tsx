import { act, fireEvent, render, renderHook, screen } from '@testing-library/react-native';
import * as React from 'react';
import { Dimensions, Platform, Text } from 'react-native';
import type { AnimatedRef, SharedValue } from 'react-native-reanimated';

import {
  createAnimatedRef,
  installAnimationHarness,
  scrollEvent,
} from '../__fixtures__/animationHarness';
import type { PagerMethods } from '../predefinedComponents/TabbedHeader/TabbedHeaderProps';
import { Pager } from '../predefinedComponents/TabbedHeader/components/Pager';
import { Tabs } from '../predefinedComponents/TabbedHeader/components/Tabs';
import { useTabbedHeaderList } from '../predefinedComponents/TabbedHeader/hooks/useTabbedHeader';
import type { ScrollViewRef, SectionListRef } from '../primitiveComponents/ScrollComponent';

beforeEach(() => {
  jest.replaceProperty(Platform, 'OS', 'ios');
});
afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

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
    jest.advanceTimersByTime(100);
  });
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
    itemIndex: 0,
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
