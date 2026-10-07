import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as React from 'react';
import { Dimensions, Platform, StyleSheet, Text } from 'react-native';
import type { AnimatedRef, SharedValue } from 'react-native-reanimated';
import * as Reanimated from 'react-native-reanimated';

import {
  createAnimatedRef,
  installAnimationHarness,
  scrollEvent,
} from '../__fixtures__/animationHarness';
import { getBoundedVisualScrollCandidate } from '../__fixtures__/predefinedPerformanceCandidates';
import { TabbedHeaderPager } from '../predefinedComponents/TabbedHeader/TabbedHeaderPager';
import type { PagerMethods } from '../predefinedComponents/TabbedHeader/TabbedHeaderProps';
import { Foreground } from '../predefinedComponents/TabbedHeader/components/HeaderForeground';
import { Pager } from '../predefinedComponents/TabbedHeader/components/Pager';
import { Tabs } from '../predefinedComponents/TabbedHeader/components/Tabs';
import type { ScrollViewRef } from '../primitiveComponents/ScrollComponent';

beforeEach(() => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  const { interpolate } = jest.requireActual<{ interpolate: typeof Reanimated.interpolate }>(
    'react-native-reanimated/src/interpolation'
  );

  jest.spyOn(Reanimated, 'interpolate').mockImplementation(interpolate);
});
afterEach(() => {
  jest.restoreAllMocks();
});

function underline() {
  const root = screen.root;

  if (!root) {
    throw new Error('The tab strip did not render');
  }

  const view = root.queryAll((node) => StyleSheet.flatten(node.props.style)?.height === 3)[0];

  if (!view) {
    throw new Error('The tab underline did not render');
  }

  return view;
}

test('identical fractional tab measurements avoid rendering the tab contents again', async () => {
  installAnimationHarness();
  const renderIcon = jest.fn(() => <Text>Icon</Text>);

  await render(
    <Tabs
      tabs={[
        { title: 'First', icon: renderIcon },
        { title: 'Second', icon: renderIcon },
      ]}
      activeTab={0}
      horizontalScrollValue={{ value: 0 } as SharedValue<number>}
      onTabPressed={jest.fn()}
    />
  );
  const first = screen.getByRole('button', { name: 'First' });

  await fireEvent(first, 'layout', { nativeEvent: { layout: { width: 101.25 } } });
  const rendersAfterMeasurement = renderIcon.mock.calls.length;

  await fireEvent(first, 'layout', { nativeEvent: { layout: { width: 101.25 } } });
  expect(renderIcon).toHaveBeenCalledTimes(rendersAfterMeasurement);
  await fireEvent(first, 'layout', { nativeEvent: { layout: { width: 101.5 } } });
  expect(renderIcon.mock.calls.length).toBeGreaterThan(rendersAfterMeasurement);
});

test.each([3, 20, 100])(
  'isolated JS fixture with %s tabs avoids icon renders for 20 repeated measurements',
  async (tabCount) => {
    installAnimationHarness();
    const renderIcon = jest.fn(() => <Text>Icon</Text>);

    await render(
      <Tabs
        tabs={Array.from({ length: tabCount }, (_, index) => ({
          title: `Tab ${index}`,
          icon: renderIcon,
        }))}
        activeTab={0}
        horizontalScrollValue={{ value: 0 } as SharedValue<number>}
        onTabPressed={jest.fn()}
      />
    );
    const first = screen.getByRole('button', { name: 'Tab 0' });
    const measurement = { nativeEvent: { layout: { width: 101.25 } } };

    await fireEvent(first, 'layout', measurement);
    expect(renderIcon).toHaveBeenCalledTimes(tabCount * 2);
    for (let repeat = 0; repeat < 20; repeat++) {
      await fireEvent(first, 'layout', measurement);
    }

    // Invocation counts demonstrate JS render avoidance, not native frame-rate improvement.
    expect(renderIcon).toHaveBeenCalledTimes(tabCount * 2);
  }
);

test('fractional widths measured before enabling the underline retain their geometry', async () => {
  installAnimationHarness();
  const horizontalScrollValue = {
    value: Dimensions.get('window').width,
  } as SharedValue<number>;
  const props = {
    tabs: [{ title: 'First' }, { title: 'Second' }],
    activeTab: 0,
    horizontalScrollValue,
    onTabPressed: jest.fn(),
  };

  await render(<Tabs {...props} />);
  await fireEvent(screen.getByRole('button', { name: 'First' }), 'layout', {
    nativeEvent: { layout: { width: 101.25 } },
  });
  await fireEvent(screen.getByRole('button', { name: 'Second' }), 'layout', {
    nativeEvent: { layout: { width: 137.5 } },
  });
  await screen.rerender(<Tabs {...props} tabUnderlineColor="red" />);

  expect(underline()).toHaveStyle({ width: 137.5, transform: [{ translateX: 121.25 }] });
  await fireEvent(screen.getByRole('button', { name: 'Second' }), 'layout', {
    nativeEvent: { layout: { width: 137.75 } },
  });
  expect(underline()).toHaveStyle({ width: 137.75, transform: [{ translateX: 121.25 }] });
});

test('horizontal paging keeps its real shared driver and consumer scroll callback', async () => {
  installAnimationHarness();
  const onScroll = jest.fn();

  await render(
    <TabbedHeaderPager
      tabs={[{ title: 'First' }, { title: 'Second' }]}
      tabUnderlineColor="red"
      pagerProps={{ onScroll, testID: 'horizontal-pager' }}>
      <Text>First page</Text>
      <Text>Second page</Text>
    </TabbedHeaderPager>
  );
  await fireEvent(screen.getByRole('button', { name: 'First' }), 'layout', {
    nativeEvent: { layout: { width: 101.25 } },
  });
  await fireEvent(screen.getByRole('button', { name: 'Second' }), 'layout', {
    nativeEvent: { layout: { width: 137.5 } },
  });
  const event = scrollEvent(0, 0, Dimensions.get('window').width * 0.625);

  await fireEvent.scroll(screen.getByTestId('horizontal-pager'), { nativeEvent: event });

  expect(onScroll).toHaveBeenCalledTimes(1);
  expect(onScroll).toHaveBeenLastCalledWith(expect.objectContaining(event));
  // Re-evaluate the mocked animated style after the shared horizontal driver changes.
  await fireEvent(screen.getByRole('button', { name: 'First' }), 'layout', {
    nativeEvent: { layout: { width: 101.5 } },
  });
  expect(underline()).toHaveStyle({ width: 124, transform: [{ translateX: 83.4375 }] });
});

test('pager preserves initial offsets, native page state and the initial page lifetimes', async () => {
  const harness = installAnimationHarness();
  const ref = React.createRef<PagerMethods>();
  const onChangeTab = jest.fn();
  const mounts: number[] = [];
  const unmounts: number[] = [];

  function Page({ index }: { index: number }) {
    React.useEffect(() => {
      mounts.push(index);

      return () => {
        unmounts.push(index);
      };
    }, [index]);

    return <Text>Page {index}</Text>;
  }

  await render(
    <Pager
      ref={ref}
      initialPage={2}
      page={-1}
      testID="pager-offset"
      minScrollHeight={300}
      scrollHeight={400}
      scrollRef={createAnimatedRef<ScrollViewRef>() as AnimatedRef<ScrollViewRef>}
      scrollValue={{ value: 0 } as SharedValue<number>}
      onChangeTab={onChangeTab}>
      {Array.from({ length: 6 }, (_, index) => (
        <Page key={index} index={index} />
      ))}
    </Pager>
  );
  const width = Dimensions.get('window').width;
  const list = screen.getByTestId('pager-offset');

  expect(list.props.contentOffset).toEqual({ x: width * 2, y: 0 });
  expect(list.props.initialNumToRender).toBeUndefined();
  expect(list.props.windowSize).toBeUndefined();
  expect(list.props.initialScrollIndex).toBeUndefined();
  expect(mounts).toEqual([0, 1, 2, 3, 4, 5]);
  expect(unmounts).toEqual([]);
  await act(() => harness.scrollHandlers[0].current.onMomentumEnd?.(scrollEvent(0, 0, width * 3)));
  expect(onChangeTab).toHaveBeenLastCalledWith(2, 3);
  await act(() => ref.current?.goToPage(0));
  expect(onChangeTab).toHaveBeenLastCalledWith(3, 0);
  expect(mounts).toEqual([0, 1, 2, 3, 4, 5]);
  expect(unmounts).toEqual([]);
  await screen.unmount();
  expect(unmounts).toEqual([0, 1, 2, 3, 4, 5]);
});

test.each([
  [280, 280],
  [320, 640],
  [440, 440],
  [280, 200],
  [0, 0],
  [-30, 200],
  [Number.NaN, 300],
  [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
])(
  'private bounded driver preserves Tabbed foreground scalar output at heights %s/%s',
  async (parallaxHeight, scrollHeight) => {
    const props = {
      foregroundImage: { uri: 'local-tabbed-image' },
      height: parallaxHeight,
      title: 'Tabbed title',
    };
    const offsets = [
      Number.NEGATIVE_INFINITY,
      -100,
      -0,
      0,
      ...[0.199, 0.2, 0.22, 0.25, 0.27, 0.3, 0.45, 0.451].map(
        (fraction) => parallaxHeight * fraction
      ),
      scrollHeight,
      scrollHeight + 1,
      10000,
      Number.POSITIVE_INFINITY,
      Number.NaN,
    ];

    await render(<Foreground {...props} scrollValue={{ value: 0 } as SharedValue<number>} />);
    for (const offset of offsets) {
      await screen.rerender(
        <Foreground {...props} scrollValue={{ value: offset } as SharedValue<number>} />
      );
      const originalOutput = screen.toJSON();
      const candidateOffset = getBoundedVisualScrollCandidate(offset, parallaxHeight, scrollHeight);

      await screen.rerender(
        <Foreground {...props} scrollValue={{ value: candidateOffset } as SharedValue<number>} />
      );
      // This checks numerical mock output; native layout, pixels and frame time remain unproved.
      expect(screen.toJSON()).toEqual(originalOutput);
    }
  }
);
