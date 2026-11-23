import { act, fireEvent, render, renderHook, screen } from '@testing-library/react-native';
import * as React from 'react';
import { Dimensions, FlatList, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import type { AnimatedRef, SharedValue } from 'react-native-reanimated';
import * as Reanimated from 'react-native-reanimated';

import {
  createAnimatedRef,
  installAnimationHarness,
  scrollEvent,
} from '../__fixtures__/animationHarness';
import { useAccessibilityPreferences } from '../hooks/useAccessibilityPreferences';
import { TabbedHeaderPager } from '../predefinedComponents/TabbedHeader/TabbedHeaderPager';
import type { PagerMethods } from '../predefinedComponents/TabbedHeader/TabbedHeaderProps';
import { Pager } from '../predefinedComponents/TabbedHeader/components/Pager';
import { Tabs } from '../predefinedComponents/TabbedHeader/components/Tabs';
import { useTabbedFlashListHeader } from '../predefinedComponents/TabbedHeader/hooks/useTabbedFlashListHeader';
import { useTabbedHeaderList } from '../predefinedComponents/TabbedHeader/hooks/useTabbedHeader';
import type { ScrollViewRef, SectionListRef } from '../primitiveComponents/ScrollComponent';

jest.mock('../hooks/useAccessibilityPreferences');
const preferences = jest.mocked(useAccessibilityPreferences);
const width = Dimensions.get('window').width;

beforeEach(() => {
  const { interpolate } = jest.requireActual<{ interpolate: typeof Reanimated.interpolate }>(
    'react-native-reanimated/src/interpolation'
  );

  jest.spyOn(Reanimated, 'interpolate').mockImplementation(interpolate);
  jest.replaceProperty(Platform, 'OS', 'ios');
  preferences.mockReturnValue({ reduceMotion: false, screenReaderEnabled: false });
});
afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

function Counter({ name }: { name: string }) {
  const [count, setCount] = React.useState(0);

  return (
    <View testID={name}>
      <Text>
        {name} count {count}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Increment ${name}`}
        onPress={() => setCount(count + 1)}>
        <Text>Increment</Text>
      </Pressable>
    </View>
  );
}

function pagerProps() {
  return {
    page: -1,
    minScrollHeight: 300,
    scrollHeight: 400,
    scrollRef: createAnimatedRef<ScrollViewRef>() as AnimatedRef<ScrollViewRef>,
    scrollValue: { value: 120 } as SharedValue<number>,
  };
}

function expectPage(name: string, inactive: boolean) {
  const page = screen.getByTestId(name, { includeHiddenElements: true }).parent;

  expect(page?.props).toMatchObject({
    'accessibilityElementsHidden': inactive,
    'importantForAccessibility': inactive ? 'no-hide-descendants' : 'auto',
    'aria-hidden': inactive,
  });
  if (Platform.OS === 'web') expect(page?.props.inert).toBe(inactive);
  expect(screen.queryByRole('button', { name: `Increment ${name}` }) === null).toBe(inactive);
}

test.each(['ios', 'web'] as const)(
  '%s pager exposes only the active rendered page across initial, imperative, swipe and controlled changes',
  async (platform) => {
    jest.useFakeTimers();
    jest.replaceProperty(Platform, 'OS', platform);
    const harness = installAnimationHarness();
    const ref = React.createRef<PagerMethods>();
    const props = pagerProps();
    const pages = [
      <Counter key="first" name="First" />,
      <Counter key="second" name="Second" />,
      <Counter key="third" name="Third" />,
    ];

    await render(
      <Pager {...props} ref={ref} initialPage={1}>
        {pages}
      </Pager>
    );
    expectPage('First', true);
    expectPage('Second', false);
    expectPage('Third', true);
    await fireEvent.press(screen.getByRole('button', { name: 'Increment Second' }));
    const second = screen.getByTestId('Second');

    await act(() => ref.current?.goToPage(2));
    expectPage('Second', true);
    expectPage('Third', false);
    expect(screen.getByTestId('Second', { includeHiddenElements: true })).toBe(second);
    await act(() => {
      const handlers = harness.scrollHandlers[0].current;

      if (platform === 'web') {
        handlers.onScroll?.(scrollEvent(0, 0, 0));
        jest.advanceTimersByTime(100);
      } else handlers.onMomentumEnd?.(scrollEvent(0, 0, 0));
    });
    expectPage('First', false);
    expectPage('Third', true);
    await screen.rerender(
      <Pager {...props} ref={ref} initialPage={1} page={1}>
        {pages}
      </Pager>
    );
    expectPage('First', true);
    expectPage('Second', false);
    expect(screen.getByText('Second count 1')).toBeVisible();
  }
);

test('reduced page navigation immediately reaches horizontal and saved vertical destinations', async () => {
  preferences.mockReturnValue({ reduceMotion: true, screenReaderEnabled: false });
  const { scrollTo } = installAnimationHarness();
  const withDelay = jest.spyOn(Reanimated, 'withDelay');
  const ref = React.createRef<PagerMethods>();
  const props = pagerProps();

  await render(
    <Pager {...props} ref={ref} rememberTabScrollPosition>
      <Text>First</Text>
      <Text>Second</Text>
    </Pager>
  );
  await act(() => ref.current?.goToPage(1));
  expect(scrollTo).toHaveBeenCalledWith(expect.anything(), width, 0, false);
  expect(scrollTo).toHaveBeenCalledWith(props.scrollRef, 0, 400, false);
  props.scrollValue.value = 220;
  scrollTo.mockClear();
  await act(() => ref.current?.goToPage(0));
  expect(scrollTo).toHaveBeenCalledWith(props.scrollRef, 0, 120, false);
  await act(() => ref.current?.goToPage(1));
  expect(scrollTo).toHaveBeenCalledWith(props.scrollRef, 0, 220, false);
  expect(withDelay).not.toHaveBeenCalled();
});

test('a live reduced-motion change completes a pending restoration without replaying initial pager nudges', async () => {
  const { scrollTo } = installAnimationHarness();
  const initialScroll = jest.spyOn(FlatList.prototype, 'scrollToOffset');

  // Hold the normal-mode restoration instead of completing it synchronously in the mock.
  jest.spyOn(Reanimated, 'withTiming').mockImplementation((value) => value);
  const ref = React.createRef<PagerMethods>();
  const props = pagerProps();
  const element = () => (
    <Pager {...props} ref={ref}>
      <Text>First</Text>
      <Text>Second</Text>
    </Pager>
  );

  await render(element());
  expect(initialScroll).toHaveBeenCalledTimes(2);
  await act(() => ref.current?.goToPage(1));
  expect(scrollTo).toHaveBeenCalledWith(expect.anything(), width, 0, true);
  expect(scrollTo).not.toHaveBeenCalledWith(props.scrollRef, 0, 400, true);
  scrollTo.mockClear();
  preferences.mockReturnValue({ reduceMotion: true, screenReaderEnabled: false });
  await screen.rerender(element());
  expect(scrollTo).toHaveBeenCalledWith(props.scrollRef, 0, 400, false);
  expect(initialScroll).toHaveBeenCalledTimes(2);
  preferences.mockReturnValue({ reduceMotion: false, screenReaderEnabled: false });
  await screen.rerender(element());
  expect(scrollTo.mock.calls.filter(([target]) => Object.is(target, props.scrollRef))).toHaveLength(
    1
  );
  expect(initialScroll).toHaveBeenCalledTimes(2);
});

test('tabs expose selected state and reduced underline destinations while normal mode follows swipe progress', async () => {
  installAnimationHarness();
  const styles: (() => Record<string, unknown>)[] = [];

  jest.spyOn(Reanimated, 'useAnimatedStyle').mockImplementation(((
    updater: () => Record<string, unknown>
  ) => {
    styles.push(updater);

    return updater();
  }) as unknown as typeof Reanimated.useAnimatedStyle);
  const horizontalScrollValue = { value: width / 2 } as SharedValue<number>;
  const onTabPressed = jest.fn();
  const element = (activeTab: number) => (
    <Tabs
      tabs={[{ title: 'First' }, { title: 'Second' }]}
      activeTab={activeTab}
      horizontalScrollValue={horizontalScrollValue}
      onTabPressed={onTabPressed}
      tabUnderlineColor="red"
    />
  );

  await render(element(0));
  await fireEvent(screen.getByRole('tab', { name: 'First' }), 'layout', {
    nativeEvent: { layout: { width: 50 } },
  });
  await fireEvent(screen.getByRole('tab', { name: 'Second' }), 'layout', {
    nativeEvent: { layout: { width: 90 } },
  });
  const underline = () => styles.filter((evaluate) => 'transform' in evaluate()).at(-1)?.();

  expect(underline()).toMatchObject({ transform: [{ translateX: 45 }], width: 70 });
  expect(screen.getByRole('tab', { name: 'First', selected: true })).toBeVisible();
  expect(screen.getByRole('tab', { name: 'Second', selected: false })).toBeVisible();
  await fireEvent.press(screen.getByRole('tab', { name: 'Second' }));
  expect(onTabPressed).toHaveBeenCalledWith(1);
  preferences.mockReturnValue({ reduceMotion: true, screenReaderEnabled: false });
  await screen.rerender(element(1));
  expect(screen.getByRole('tab', { name: 'Second', selected: true })).toBeVisible();
  expect(underline()).toMatchObject({ transform: [{ translateX: 70 }], width: 90 });
  horizontalScrollValue.value = width / 4;
  expect(underline()).toMatchObject({ transform: [{ translateX: 70 }], width: 90 });
  preferences.mockReturnValue({ reduceMotion: false, screenReaderEnabled: false });
  await screen.rerender(element(1));
  expect(underline()).toMatchObject({ transform: [{ translateX: 32.5 }], width: 60 });
});

test('tab strip live preference changes preserve its position and use immediate future scrolling', async () => {
  installAnimationHarness();
  const scrollTo = jest.spyOn(ScrollView.prototype, 'scrollTo');
  const scrollToEnd = jest.spyOn(ScrollView.prototype, 'scrollToEnd');
  const element = (activeTab: number) => (
    <Tabs
      tabs={['First', 'Second', 'Third', 'Fourth'].map((title) => ({ title }))}
      activeTab={activeTab}
      horizontalScrollValue={{ value: 0 } as SharedValue<number>}
      onTabPressed={jest.fn()}
    />
  );

  await render(element(0));
  scrollTo.mockClear();
  scrollToEnd.mockClear();
  preferences.mockReturnValue({ reduceMotion: true, screenReaderEnabled: false });
  await screen.rerender(element(0));
  expect(scrollTo).not.toHaveBeenCalled();
  await screen.rerender(element(3));
  expect(scrollToEnd).toHaveBeenLastCalledWith({ animated: false });
  scrollTo.mockClear();
  scrollToEnd.mockClear();
  preferences.mockReturnValue({ reduceMotion: false, screenReaderEnabled: false });
  await screen.rerender(element(3));
  expect(scrollTo).not.toHaveBeenCalled();
  expect(scrollToEnd).not.toHaveBeenCalled();
  await screen.rerender(element(0));
  expect(scrollTo).toHaveBeenLastCalledWith({ animated: true, x: 0 });
});

test('tab selection makes the destination page available in the public pager', async () => {
  preferences.mockReturnValue({ reduceMotion: true, screenReaderEnabled: true });
  installAnimationHarness();
  await render(
    <TabbedHeaderPager title="Heading" tabs={[{ title: 'First' }, { title: 'Second' }]}>
      <Counter name="First" />
      <Counter name="Second" />
    </TabbedHeaderPager>
  );
  expectPage('First', false);
  expectPage('Second', true);
  await fireEvent.press(screen.getByRole('tab', { name: 'Second' }));
  expectPage('First', true);
  expectPage('Second', false);
  expect(screen.getByRole('tab', { name: 'Second', selected: true })).toBeVisible();
});

test('reduced SectionList jumps allow subsequent manual viewability to select another section', async () => {
  installAnimationHarness();
  const sections = [
    { key: 'first', data: ['one'] },
    { key: 'second', data: ['two'] },
  ];
  const hook = await renderHook(() =>
    useTabbedHeaderList({ sections, tabs: [{ title: 'First' }, { title: 'Second' }] })
  );
  const scrollToLocation = jest.fn();

  hook.result.current.scrollViewRef.current = { scrollToLocation } as unknown as SectionListRef<
    string,
    (typeof sections)[number]
  >;
  preferences.mockReturnValue({ reduceMotion: true, screenReaderEnabled: false });
  await hook.rerender({});
  await act(() => hook.result.current.goToSection(1));
  expect(scrollToLocation).toHaveBeenLastCalledWith(
    expect.objectContaining({ animated: false, sectionIndex: 1 })
  );
  expect(hook.result.current.renderTabs()?.props.activeTab).toBe(1);
  await act(() =>
    hook.result.current.onViewableItemsChanged({
      viewableItems: [
        { item: 'one', index: 0, isViewable: true, key: 'one', section: sections[0] },
      ],
      changed: [],
    })
  );
  expect(hook.result.current.renderTabs()?.props.activeTab).toBe(0);
});

test('reduced FlashList jumps allow subsequent manual viewability to select another section', async () => {
  installAnimationHarness();
  const hook = await renderHook(() =>
    useTabbedFlashListHeader({
      data: ['one', 'two'],
      renderItem: ({ item }) => <Text>{item}</Text>,
      stickyHeaderIndices: [0, 1],
      tabs: [{ title: 'First' }, { title: 'Second' }],
    })
  );
  const scrollToIndex = jest.fn();

  hook.result.current.scrollViewRef.current = { scrollToIndex } as unknown as NonNullable<
    typeof hook.result.current.scrollViewRef.current
  >;
  preferences.mockReturnValue({ reduceMotion: true, screenReaderEnabled: false });
  await hook.rerender({});
  await act(() => hook.result.current.goToSection(1));
  expect(scrollToIndex).toHaveBeenLastCalledWith(
    expect.objectContaining({ animated: false, index: 1 })
  );
  expect(hook.result.current.renderTabs()?.props.activeTab).toBe(1);
  await act(() =>
    hook.result.current.onViewableItemsChanged({
      viewableItems: [{ item: 'one', index: 0, isViewable: true, key: 'one', timestamp: 0 }],
      changed: [],
    })
  );
  expect(hook.result.current.renderTabs()?.props.activeTab).toBe(0);
});
