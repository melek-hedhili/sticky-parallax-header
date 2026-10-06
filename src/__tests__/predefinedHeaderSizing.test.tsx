import type { FlashListRef } from '@shopify/flash-list';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react-native';
import * as ReactNative from 'react-native';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { installAnimationHarness, scrollEvent } from '../__fixtures__/animationHarness';
import { useAvatarHeader } from '../predefinedComponents/AvatarHeader/hooks/useAvatarHeader';
import type { SharedPredefinedProps } from '../predefinedComponents/common/SharedProps';
import { usePredefinedFlashListHeader } from '../predefinedComponents/common/hooks/usePredefinedFlashListHeader';
import { usePredefinedHeader } from '../predefinedComponents/common/hooks/usePredefinedHeader';
import { getForegroundImageSizes } from '../predefinedComponents/common/utils/getForegroundImageSizes';
import type { ScrollViewRef } from '../primitiveComponents/ScrollComponent';
import { useStickyHeaderScrollProps } from '../primitiveComponents/useStickyHeaderScrollProps';
import { withStickyHeader } from '../primitiveComponents/withStickyHeader';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const useNative = (props: SharedPredefinedProps) => usePredefinedHeader<ScrollViewRef>(props);
const useFlash = (props: SharedPredefinedProps) =>
  usePredefinedFlashListHeader<FlashListRef<string>>(props);
const dimensions = { width: 390, height: 844, scale: 1, fontScale: 1 };

beforeEach(() => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  jest.mocked(ReactNative.useWindowDimensions).mockReturnValue(dimensions);
});
afterEach(() => {
  jest.restoreAllMocks();
});

describe.each([
  ['native', useNative],
  ['FlashList', useFlash],
] as const)('%s predefined header sizing', (kind, usePredefined) => {
  test('shares compact render geometry and snap distance, preserving explicit heights', async () => {
    const harness = installAnimationHarness();
    const hook = await renderHook((props: SharedPredefinedProps) => usePredefined(props), {
      initialProps: {},
    });
    const scrollToOffset = jest.fn();

    if (kind === 'FlashList') {
      hook.result.current.scrollViewRef.current = {
        scrollToOffset,
      } as unknown as FlashListRef<string> & ScrollViewRef;
    }

    async function expectGeometry(
      parallaxHeight: number,
      scrollHeight: number,
      innerScrollHeight: number
    ) {
      expect(hook.result.current).toMatchObject({
        parallaxHeight,
        scrollHeight,
        innerScrollHeight,
      });
      await act(() => {
        hook.result.current.onScroll(scrollEvent(scrollHeight - 1));
        hook.result.current.onMomentumScrollEnd(scrollEvent(scrollHeight - 1));
      });

      if (kind === 'FlashList') {
        expect(scrollToOffset).toHaveBeenLastCalledWith({ offset: scrollHeight, animated: true });
      } else {
        expect(harness.scrollTo).toHaveBeenLastCalledWith(
          hook.result.current.scrollViewRef,
          0,
          scrollHeight,
          true
        );
      }
    }

    await expectGeometry(280, 280, 464);
    await hook.rerender({ parallaxHeight: 440 });
    await expectGeometry(440, 440, 304);
    await hook.rerender({ parallaxHeight: 100, headerHeight: 200 });
    await expectGeometry(100, 400, 244);
    await hook.rerender({ parallaxHeight: 100, headerHeight: 500 });
    await expectGeometry(100, 1000, 0);
  });

  test('responds to viewport changes with bounded portrait and short-landscape defaults', async () => {
    installAnimationHarness();
    const hook = await renderHook((props: SharedPredefinedProps) => usePredefined(props), {
      initialProps: {},
    });

    expect(hook.result.current.parallaxHeight).toBe(280);
    jest.mocked(ReactNative.useWindowDimensions).mockReturnValue({ ...dimensions, height: 950 });
    await hook.rerender({});
    expect(hook.result.current).toMatchObject({
      parallaxHeight: 304,
      scrollHeight: 304,
      innerScrollHeight: 546,
    });
    jest
      .mocked(ReactNative.useWindowDimensions)
      .mockReturnValue({ ...dimensions, width: 768, height: 1200 });
    await hook.rerender({});
    expect(hook.result.current.parallaxHeight).toBe(320);
    jest
      .mocked(ReactNative.useWindowDimensions)
      .mockReturnValue({ ...dimensions, width: 844, height: 390 });
    await hook.rerender({});
    expect(hook.result.current).toMatchObject({
      parallaxHeight: 200,
      scrollHeight: 200,
      innerScrollHeight: 90,
    });
    await hook.rerender({ parallaxHeight: 440 });
    expect(hook.result.current).toMatchObject({
      parallaxHeight: 440,
      scrollHeight: 440,
      innerScrollHeight: 0,
    });
  });
});

test('rendered predefined header measurement supplies compact content padding', async () => {
  installAnimationHarness();
  const header = await renderHook(() => useAvatarHeader<ScrollViewRef>({ title: 'Profile' }));
  const renderHeader = header.result.current.renderHeader;
  let contentPadding: unknown;
  const Probe = (props: ReactNative.ScrollViewProps) => {
    contentPadding = StyleSheet.flatten(props.contentContainerStyle)?.paddingTop;

    return <View />;
  };
  const StickyHeader = withStickyHeader(Probe);

  await render(
    <StickyHeader renderHeader={renderHeader}>
      <Text>Body</Text>
    </StickyHeader>
  );
  expect(screen.getByTestId('HeaderForeground')).toHaveStyle({ height: 280 });
  await fireEvent(screen.getByTestId('HeaderForeground'), 'layout', {
    nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 280 } },
  });
  expect(contentPadding).toBe(280);
});

test('primitive custom-header defaults retain the existing 53 percent sizing', async () => {
  installAnimationHarness();
  const hook = await renderHook(() => useStickyHeaderScrollProps<ScrollViewRef>({}));

  expect(hook.result.current.scrollHeight).toBe(844 * 0.53);
});

test.each([12, 10])(
  'compact foreground images fit tablets while preserving the %s percent shrink ratio',
  (collapsedPercent) => {
    const phone = getForegroundImageSizes(390, 280, collapsedPercent);

    expect(phone.startSize).toBeCloseTo(390 * 0.18);
    expect(phone.endSize).toBeCloseTo(390 * (collapsedPercent / 100));

    for (const tabletWidth of [768, 1024, 1366]) {
      const compact = getForegroundImageSizes(tabletWidth, 320, collapsedPercent);

      expect(compact.startSize).toBe(96);
      expect(compact.endSize).toBeCloseTo(96 * (collapsedPercent / 18));

      const custom = getForegroundImageSizes(tabletWidth, 440, collapsedPercent);

      expect(custom.startSize).toBeCloseTo(tabletWidth * 0.18);
      expect(custom.endSize).toBeCloseTo(tabletWidth * (collapsedPercent / 100));
    }
  }
);
