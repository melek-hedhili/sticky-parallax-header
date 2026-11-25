import type { FlashListProps, FlashListRef } from '@shopify/flash-list';
import { act, render, screen } from '@testing-library/react-native';
import * as React from 'react';
import { StyleSheet, Text } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import * as Reanimated from 'react-native-reanimated';

import { installAnimationHarness, scrollEvent } from '../__fixtures__/animationHarness';
import { useAccessibilityPreferences } from '../hooks/useAccessibilityPreferences';
import {
  AvatarHeaderFlatList,
  AvatarHeaderScrollView,
  AvatarHeaderSectionList,
  DetailsHeaderFlatList,
  DetailsHeaderScrollView,
  DetailsHeaderSectionList,
  TabbedHeaderList,
  TabbedHeaderPager,
} from '../index';
import { Foreground as AvatarForeground } from '../predefinedComponents/AvatarHeader/components/HeaderForeground';
import { withAvatarHeaderFlashList } from '../predefinedComponents/AvatarHeader/withAvatarHeaderFlashList';
import { Foreground as DetailsForeground } from '../predefinedComponents/DetailsHeader/components/HeaderForeground';
import { withDetailsHeaderFlashList } from '../predefinedComponents/DetailsHeader/withDetailsHeaderFlashList';
import { Foreground as TabbedForeground } from '../predefinedComponents/TabbedHeader/components/HeaderForeground';
import { withTabbedHeaderFlashList } from '../predefinedComponents/TabbedHeader/withTabbedHeaderFlashList';
import { HeaderWrapper } from '../predefinedComponents/common/components/HeaderWrapper';
import { ElasticHeaderProvider } from '../primitiveComponents/ElasticHeaderContext';

jest.mock('../hooks/useAccessibilityPreferences');

const preferences = jest.mocked(useAccessibilityPreferences);
const Probe = React.forwardRef<FlashListRef<string>, FlashListProps<string>>((_props, _ref) => (
  <Text>Continuous rows</Text>
));
const AvatarFlash = withAvatarHeaderFlashList<string>(Probe);
const DetailsFlash = withDetailsHeaderFlashList<string>(Probe);
const TabbedFlash = withTabbedHeaderFlashList<string>(Probe);
const data = ['Body'];
const sections = [{ key: 'body', data }];
const renderItem = () => <Text>Body</Text>;
const image = { uri: 'decorative-image' };
// Deliberately exercise caller contrast against a white header.
// eslint-disable-next-line react-native/no-color-literals
const titleStyles = StyleSheet.create({ readable: { color: 'black' } });
const shared = { title: 'Heading', subtitle: 'Subtitle' };
const details = { ...shared, tag: 'Tag', contentIconNumber: 0 };
const tabbed = { title: 'Heading' };

const variants = [
  ['Avatar scroll', 'Heading, Subtitle', <AvatarHeaderScrollView {...shared} />],
  [
    'Avatar flat',
    'Heading, Subtitle',
    <AvatarHeaderFlatList {...shared} data={data} renderItem={renderItem} />,
  ],
  [
    'Avatar section',
    'Heading, Subtitle',
    <AvatarHeaderSectionList {...shared} sections={sections} renderItem={renderItem} />,
  ],
  [
    'Avatar FlashList',
    'Heading, Subtitle',
    <AvatarFlash {...shared} data={data} renderItem={renderItem} />,
  ],
  ['Details scroll', 'Heading, Subtitle, Tag, 0', <DetailsHeaderScrollView {...details} />],
  [
    'Details flat',
    'Heading, Subtitle, Tag, 0',
    <DetailsHeaderFlatList {...details} data={data} renderItem={renderItem} />,
  ],
  [
    'Details section',
    'Heading, Subtitle, Tag, 0',
    <DetailsHeaderSectionList {...details} sections={sections} renderItem={renderItem} />,
  ],
  [
    'Details FlashList',
    'Heading, Subtitle, Tag, 0',
    <DetailsFlash {...details} data={data} renderItem={renderItem} />,
  ],
  [
    'Tabbed pager without logo',
    'Heading',
    <TabbedHeaderPager {...tabbed}>
      <Text>Page</Text>
    </TabbedHeaderPager>,
  ],
  [
    'Tabbed list with logo',
    'Heading',
    <TabbedHeaderList {...tabbed} logo={image} sections={sections} renderItem={renderItem} />,
  ],
  [
    'Tabbed FlashList without logo',
    'Heading',
    <TabbedFlash {...tabbed} data={data} renderItem={renderItem} />,
  ],
] as const;

beforeEach(() => {
  const { interpolate } = jest.requireActual<{ interpolate: typeof Reanimated.interpolate }>(
    'react-native-reanimated/src/interpolation'
  );

  jest.spyOn(Reanimated, 'interpolate').mockImplementation(interpolate);
  preferences.mockReturnValue({ reduceMotion: false, screenReaderEnabled: true });
});
afterEach(() => jest.restoreAllMocks());

test.each(variants)(
  '%s exposes one canonical fixed heading and hides only its default duplicate',
  async (_name, summary, element) => {
    installAnimationHarness();
    await render(element);
    expect(screen.getAllByRole('header')).toHaveLength(1);
    expect(screen.getByRole('header', { name: summary })).toBeVisible();
    const foreground = screen.getByTestId('HeaderForeground');

    expect(foreground.children[0]).toMatchObject({
      props: {
        'accessibilityElementsHidden': true,
        'importantForAccessibility': 'no-hide-descendants',
        'aria-hidden': true,
      },
    });
  }
);

test.each([
  [
    'Avatar',
    <AvatarHeaderScrollView title="   " subtitle="About" />,
    'About',
    'AvatarHeaderBarTestID',
  ],
  [
    'Details',
    <DetailsHeaderScrollView title="" subtitle="Author" tag="Tag" contentIconNumber={0} />,
    'Author, Tag, 0',
    'DetailsHeaderBarTitleTestID',
  ],
  [
    'zero only',
    <DetailsHeaderScrollView contentIconNumber={0} />,
    '0',
    'DetailsHeaderBarTitleTestID',
  ],
  [
    'Details fallback',
    <DetailsHeaderScrollView title="Heading" contentIconNumber={0} />,
    'Heading, 0',
    'DetailsHeaderBarTitleTestID',
  ],
] as const)(
  '%s preserves meaningful fallback text and zero without repeated fallback title',
  async (_name, element, summary, testID) => {
    installAnimationHarness();
    await render(element);
    expect(screen.getByRole('header', { name: summary })).toBeVisible();
    expect(screen.getByTestId(testID).props.children).toBe(
      summary.startsWith('Heading') ? 'Heading' : summary
    );
  }
);

test('empty summary leaves default foreground available and does not invent a heading', async () => {
  installAnimationHarness();
  await render(<AvatarHeaderScrollView />);
  expect(screen.queryByRole('header')).toBeNull();
  expect(screen.getByTestId('HeaderForeground').children[0]).toMatchObject({
    props: { accessibilityElementsHidden: false },
  });
});

test.each([
  ['Avatar', AvatarHeaderScrollView],
  ['Details', DetailsHeaderScrollView],
] as const)(
  '%s fixed heading remains visible and mounted across collapsed offsets, with controls separate',
  async (_variant, Header) => {
    const harness = installAnimationHarness();
    const onScroll = jest.fn();
    const element = () => (
      <Header
        title="Heading"
        subtitle="Subtitle"
        onScroll={onScroll}
        leftTopIcon={() => <Text>Back icon</Text>}
        leftTopIconAccessibilityLabel="Back"
      />
    );

    await render(element());
    const heading = screen.getByRole('header', { name: 'Heading, Subtitle' });

    expect(screen.getByRole('button', { name: 'Back' })).not.toBe(heading);
    // Deliver the primitive's actual native-scroll callback to update the shared
    // value created by the public header, rather than passing an unused prop.
    expect(harness.scrollHandlers).toHaveLength(1);
    await act(() => harness.scrollHandlers[0].current.onScroll?.(scrollEvent(1000)));
    expect(onScroll).toHaveBeenCalledWith(
      expect.objectContaining({ contentOffset: { x: 0, y: 1000 } })
    );
    await screen.rerender(element());
    expect(screen.getByRole('header', { name: 'Heading, Subtitle' })).toBe(heading);
    expect(heading).toBeVisible();
  }
);

test.each([
  ['Avatar', AvatarHeaderScrollView],
  ['Details', DetailsHeaderScrollView],
] as const)(
  '%s custom foreground and bar retain caller semantics in all mixed cases',
  async (_variant, Header) => {
    installAnimationHarness();
    const customForeground = () => <Text accessibilityRole="header">Caller heading</Text>;
    const customBar = () => <Text accessibilityRole="button">Caller bar</Text>;

    await render(
      <Header title="Built-in" subtitle="Default metadata" renderHeader={customForeground} />
    );
    expect(screen.getByRole('header', { name: 'Caller heading' })).toBeVisible();
    expect(screen.getByRole('header', { name: 'Built-in' })).toBeVisible();
    expect(screen.queryByRole('header', { name: 'Built-in, Default metadata' })).toBeNull();
    await screen.rerender(<Header title="Built-in" renderHeaderBar={customBar} />);
    expect(screen.getByRole('button', { name: 'Caller bar' })).toBeVisible();
    expect(screen.getByTestId('HeaderForeground').children[0]).toMatchObject({
      props: { accessibilityElementsHidden: false },
    });
    await screen.rerender(<Header renderHeader={customForeground} renderHeaderBar={customBar} />);
    expect(screen.getByRole('header', { name: 'Caller heading' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Caller bar' })).toBeVisible();
  }
);

test('custom Tabbed header, bar and tabs remain caller-owned', async () => {
  installAnimationHarness();
  await render(
    <TabbedHeaderPager
      title="Ignored metadata"
      renderHeader={() => <Text accessibilityRole="header">Caller heading</Text>}
      renderHeaderBar={() => <Text>Caller bar</Text>}
      renderTabs={() => <Text accessibilityRole="tab">Caller tab</Text>}>
      <Text>Page</Text>
    </TabbedHeaderPager>
  );
  expect(screen.getByRole('header', { name: 'Caller heading' })).toBeVisible();
  expect(screen.getByRole('tab', { name: 'Caller tab' })).toBeVisible();
  expect(screen.getAllByRole('header')).toHaveLength(1);
});

test('default foreground stays semantically available when a custom bar returns null', async () => {
  installAnimationHarness();
  await render(
    <TabbedHeaderPager title="Expanded heading" renderHeaderBar={() => null}>
      <Text>Page</Text>
    </TabbedHeaderPager>
  );
  expect(screen.getByText('Expanded heading')).toBeVisible();
});

test('reduced motion fixes foreground image geometry, keeps text opaque, and removes backdrop stretching', async () => {
  preferences.mockReturnValue({ reduceMotion: true, screenReaderEnabled: false });
  const styles: (() => Record<string, unknown>)[] = [];

  jest.spyOn(Reanimated, 'useAnimatedStyle').mockImplementation(((
    updater: () => Record<string, unknown>
  ) => {
    styles.push(updater);

    return updater();
  }) as unknown as typeof Reanimated.useAnimatedStyle);
  const scrollValue = { value: 0 } as SharedValue<number>;

  await render(
    <ElasticHeaderProvider
      value={{ displacement: { value: 80 } as SharedValue<number>, reset: jest.fn() }}>
      <HeaderWrapper parallaxHeight={300} scrollHeight={300} scrollValue={scrollValue}>
        <AvatarForeground height={300} scrollValue={scrollValue} title="Avatar" image={image} />
        <DetailsForeground height={300} scrollValue={scrollValue} title="Details" />
        <TabbedForeground
          height={300}
          scrollValue={scrollValue}
          title="Tabbed"
          foregroundImage={image}
        />
      </HeaderWrapper>
    </ElasticHeaderProvider>
  );
  const initial = styles.map((evaluate) => evaluate());

  scrollValue.value = 1000;
  expect(styles.map((evaluate) => evaluate())).toStrictEqual(initial);
  expect(screen.getByTestId('HeaderBackdrop')).toHaveStyle({
    transform: [{ translateY: expect.closeTo(0) }, { scaleY: 1 }],
  });
  expect(initial.filter((style) => 'opacity' in style).every((style) => style.opacity === 1)).toBe(
    true
  );
  expect(initial.filter((style) => 'width' in style)).toHaveLength(2);
});

test.each(variants)(
  '%s updates summary semantics when the reader changes at runtime',
  async (_name, summary, element) => {
    preferences.mockReturnValue({ reduceMotion: false, screenReaderEnabled: false });
    installAnimationHarness();
    await render(element);
    expect(screen.queryByRole('header')).toBeNull();
    expect(screen.getByTestId('HeaderForeground').children[0]).toMatchObject({
      props: { accessibilityElementsHidden: false },
    });
    preferences.mockReturnValue({ reduceMotion: false, screenReaderEnabled: true });
    await screen.rerender(React.cloneElement(element as React.ReactElement));
    expect(screen.getByRole('header', { name: summary })).toBeVisible();
    expect(screen.getByTestId('HeaderForeground').children[0]).toMatchObject({
      props: { accessibilityElementsHidden: true },
    });
    preferences.mockReturnValue({ reduceMotion: false, screenReaderEnabled: false });
    await screen.rerender(React.cloneElement(element as React.ReactElement));
    expect(screen.queryByRole('header')).toBeNull();
    expect(screen.getByTestId('HeaderForeground').children[0]).toMatchObject({
      props: { accessibilityElementsHidden: false },
    });
  }
);

test.each([
  [
    'pager',
    <TabbedHeaderPager title="Readable" backgroundColor="white" titleStyle={titleStyles.readable}>
      <Text>Page</Text>
    </TabbedHeaderPager>,
  ],
  [
    'list',
    <TabbedHeaderList
      title="Readable"
      backgroundColor="white"
      titleStyle={titleStyles.readable}
      sections={sections}
      renderItem={renderItem}
    />,
  ],
  [
    'FlashList',
    <TabbedFlash
      title="Readable"
      backgroundColor="white"
      titleStyle={titleStyles.readable}
      data={data}
      renderItem={renderItem}
    />,
  ],
] as const)('Tabbed %s reuses title styling for its fixed summary', async (_name, element) => {
  installAnimationHarness();
  await render(element);
  expect(screen.getByRole('header', { name: 'Readable' })).toHaveStyle({ color: 'black' });
});

test.each([
  ['Avatar', AvatarHeaderScrollView, 'AvatarHeaderBarTestID'],
  ['Details', DetailsHeaderScrollView, 'DetailsHeaderBarTitleTestID'],
] as const)(
  '%s preserves native summary and control hosts through live reader changes and scroll',
  async (_name, Header, titleTestID) => {
    preferences.mockReturnValue({ reduceMotion: false, screenReaderEnabled: false });
    const harness = installAnimationHarness();
    const element = () => (
      <Header
        title="Heading"
        subtitle="Subtitle"
        leftTopIcon={() => <Text>Back</Text>}
        leftTopIconAccessibilityLabel="Back"
      />
    );

    await render(element());
    const title = screen.getByTestId(titleTestID);
    const titleContainer = title.parent;
    const back = screen.getByRole('button', { name: 'Back' });

    expect(screen.queryByRole('header')).toBeNull();
    preferences.mockReturnValue({ reduceMotion: false, screenReaderEnabled: true });
    await screen.rerender(element());
    const heading = screen.getByRole('header', { name: 'Heading, Subtitle' });

    expect(heading).toBeVisible();
    expect(screen.getByTestId(titleTestID)).toBe(title);
    expect(title.parent).toBe(titleContainer);
    expect(screen.getByRole('button', { name: 'Back' })).toBe(back);
    expect(back).not.toBe(heading);
    await act(() => harness.scrollHandlers[0].current.onScroll?.(scrollEvent(1000)));
    await screen.rerender(element());
    expect(screen.getByRole('header', { name: 'Heading, Subtitle' })).toBe(heading);
    expect(heading).toBeVisible();
    preferences.mockReturnValue({ reduceMotion: false, screenReaderEnabled: false });
    await screen.rerender(element());
    expect(screen.queryByRole('header')).toBeNull();
    expect(screen.getByTestId(titleTestID)).toBe(title);
    expect(title.parent).toBe(titleContainer);
    expect(screen.getByRole('button', { name: 'Back' })).toBe(back);
    expect(screen.getByTestId('HeaderForeground').children[0]).toMatchObject({
      props: { accessibilityElementsHidden: false },
    });
  }
);
