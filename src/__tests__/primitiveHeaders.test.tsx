import type { FlashListProps, FlashListRef } from '@shopify/flash-list';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as React from 'react';
import type { ScrollViewProps } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';

import { installAnimationHarness, scrollEvent } from '../__fixtures__/animationHarness';
import { withStickyHeader } from '../primitiveComponents/withStickyHeader';
import { withStickyHeaderFlashList } from '../primitiveComponents/withStickyHeaderFlashList';

const styles = StyleSheet.create({
  content: { paddingTop: 8, paddingBottom: 12 },
  list: { paddingTop: 4 },
});
const layoutEvent = (height: number) => ({
  nativeEvent: { layout: { x: 0, y: 0, width: 300, height } },
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('function components preserve layout padding, callbacks, refresh offset, and imperative refs', async () => {
  const harness = installAnimationHarness();
  const handle = { scrollTo: jest.fn() };
  let captured: ScrollViewProps & { progressViewOffset?: number } = {};
  const Probe = React.forwardRef<typeof handle, ScrollViewProps>((props, ref) => {
    captured = props;
    React.useImperativeHandle(ref, () => handle, []);

    return <View testID="scroll-probe" />;
  });
  const Header = withStickyHeader(Probe);
  const ref = React.createRef<typeof handle>();
  const onHeaderLayout = jest.fn();
  const onTabsLayout = jest.fn();
  const onScroll = jest.fn();
  const onScrollBeginDrag = jest.fn();
  const onScrollEndDrag = jest.fn();
  const onMomentumScrollBegin = jest.fn();
  const onMomentumScrollEnd = jest.fn();

  await render(
    <Header
      ref={ref}
      contentContainerStyle={styles.content}
      style={styles.list}
      renderHeader={() => <Text>Header</Text>}
      renderTabs={() => <Text>Tabs</Text>}
      onHeaderLayout={onHeaderLayout}
      onTabsLayout={onTabsLayout}
      onScroll={onScroll}
      onScrollBeginDrag={onScrollBeginDrag}
      onScrollEndDrag={onScrollEndDrag}
      onMomentumScrollBegin={onMomentumScrollBegin}
      onMomentumScrollEnd={onMomentumScrollEnd}
    />
  );
  await fireEvent(screen.getByText('Header'), 'layout', layoutEvent(180));
  await fireEvent(screen.getByText('Tabs'), 'layout', layoutEvent(40));
  expect(StyleSheet.flatten(captured.contentContainerStyle)).toMatchObject({
    paddingTop: 188,
    paddingBottom: 52,
  });
  expect(StyleSheet.flatten(captured.style)).toMatchObject({ paddingTop: 44 });
  expect(captured.progressViewOffset).toBe(180);
  expect(onHeaderLayout).toHaveBeenCalledWith(layoutEvent(180));
  expect(onTabsLayout).toHaveBeenCalledWith(layoutEvent(40));
  expect(ref.current).toBe(handle);
  const event = scrollEvent(80);

  await act(() => {
    const callbacks = harness.scrollHandlers[0].current;

    callbacks.onScroll?.(event);
    callbacks.onBeginDrag?.(event);
    callbacks.onEndDrag?.(event);
    callbacks.onMomentumBegin?.(event);
    callbacks.onMomentumEnd?.(event);
  });
  for (const callback of [
    onScroll,
    onScrollBeginDrag,
    onScrollEndDrag,
    onMomentumScrollBegin,
    onMomentumScrollEnd,
  ]) {
    expect(callback).toHaveBeenCalledWith(event);
  }
});

test('FlashList keeps stable position-maintenance default and passes through an explicit override', async () => {
  const harness = installAnimationHarness();
  let captured: FlashListProps<string> = { data: [], renderItem: () => null };
  const handle = { scrollToOffset: jest.fn() } as unknown as FlashListRef<string>;
  const Probe = React.forwardRef<FlashListRef<string>, FlashListProps<string>>((props, ref) => {
    captured = props;
    React.useImperativeHandle(ref, () => handle, []);

    return <View />;
  });
  const Header = withStickyHeaderFlashList<string>(Probe);
  const ref = React.createRef<FlashListRef<string>>();
  const onHeaderLayout = jest.fn();
  const onScrollBeginDrag = jest.fn();

  await render(
    <Header
      ref={ref}
      data={['one']}
      renderItem={() => null}
      contentContainerStyle={styles.content}
      renderHeader={() => <Text>Flash header</Text>}
      renderTabs={() => <Text>Flash tabs</Text>}
      onHeaderLayout={onHeaderLayout}
      onScrollBeginDrag={onScrollBeginDrag}
    />
  );
  const defaultPosition = captured.maintainVisibleContentPosition;

  expect(defaultPosition).toEqual({ disabled: true });
  await fireEvent(screen.getByText('Flash header'), 'layout', layoutEvent(180));
  await fireEvent(screen.getByText('Flash tabs'), 'layout', layoutEvent(40));
  expect(captured.maintainVisibleContentPosition).toBe(defaultPosition);
  expect(StyleSheet.flatten(captured.contentContainerStyle)).toMatchObject({
    paddingTop: 188,
    paddingBottom: 52,
  });
  expect(captured.progressViewOffset).toBe(180);
  expect(onHeaderLayout).toHaveBeenCalledWith(layoutEvent(180));
  expect(ref.current).toBe(handle);
  await act(() => harness.scrollHandlers[0].current.onBeginDrag?.(scrollEvent(0)));
  expect(onScrollBeginDrag).toHaveBeenCalledTimes(1);
  const override = { disabled: false, autoscrollToTopThreshold: 0.2 };

  await screen.rerender(
    <Header data={['one']} renderItem={() => null} maintainVisibleContentPosition={override} />
  );
  expect(captured.maintainVisibleContentPosition).toBe(override);
});
