import { act, fireEvent, render, renderHook, screen } from '@testing-library/react-native';
import * as React from 'react';
import { Platform, SectionList, Text, VirtualizedList } from 'react-native';

import { installAnimationHarness } from '../__fixtures__/animationHarness';
import { TabbedHeaderList } from '../predefinedComponents/TabbedHeader/TabbedHeaderList';
import { useTabbedHeaderList } from '../predefinedComponents/TabbedHeader/hooks/useTabbedHeader';
import type { SectionListRef } from '../primitiveComponents/ScrollComponent';

type Section = { key: string; data: string[] };
type CellMetric = { index: number; length: number; offset: number; isMounted: boolean };
type ScrollTarget = {
  animated?: boolean | null;
  index: number;
  viewOffset?: number;
  viewPosition?: number;
};

// Exercise RN's real SectionList location-to-cell conversion. Only its terminal
// native scroll and measured frames are modeled; a mocked SectionList would hide
// the header cell and sticky offset behavior that caused the device regression.
const listPrototype = VirtualizedList.prototype as unknown as {
  __getListMetrics(): {
    getCellMetricsApprox(index: number, props: unknown): CellMetric;
  };
  scrollToIndex(target: ScrollTarget): void;
};

beforeEach(() => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  installAnimationHarness();
});

afterEach(() => {
  jest.restoreAllMocks();
});

function measuredList() {
  const getCellMetricsApprox = jest.fn((index: number) => ({
    index,
    length: index === 14 ? 58 : 50,
    // The retained native repro reports a sticky section header at offset 0,
    // even though its following first data row has valid content coordinates.
    offset: index === 14 ? 0 : 300 + (index - 15) * 50,
    isMounted: true,
  }));

  jest.spyOn(listPrototype, '__getListMetrics').mockReturnValue({ getCellMetricsApprox });
  const scrollToIndex = jest
    .spyOn(listPrototype, 'scrollToIndex')
    .mockImplementation(() => undefined);

  return { getCellMetricsApprox, scrollToIndex };
}

function sections(secondData = ['Row 13', 'Row 14']): Section[] {
  return [
    { key: 'first', data: Array.from({ length: 12 }, (_, index) => `Row ${index + 1}`) },
    { key: 'second', data: secondData },
  ];
}

async function renderList({
  data = sections(),
  stickySectionHeadersEnabled,
}: {
  data?: Section[];
  stickySectionHeadersEnabled?: boolean;
} = {}) {
  const ref = React.createRef<SectionListRef<string, Section>>();

  await render(
    <TabbedHeaderList<string, Section>
      ref={ref}
      sections={data}
      stickySectionHeadersEnabled={stickySectionHeadersEnabled}
      tabs={[{ title: 'First' }, { title: 'Second' }]}
      renderItem={({ item }) => <Text>{item}</Text>}
      renderSectionHeader={({ section }) => <Text>{section.key} heading</Text>}
    />
  );

  return ref;
}

test('tab navigation uses the first data cell and RN sticky-header compensation', async () => {
  const metrics = measuredList();
  const ref = await renderList();

  metrics.scrollToIndex.mockClear();
  await fireEvent.press(screen.getByRole('button', { name: 'Second' }));
  expect(metrics.scrollToIndex).toHaveBeenLastCalledWith({
    animated: true,
    itemIndex: 1,
    sectionIndex: 1,
    index: 15,
    viewOffset: 58,
    viewPosition: 0,
  });
  expect(metrics.getCellMetricsApprox).toHaveBeenCalledWith(14, expect.any(Object));
  expect(ref.current).toBeInstanceOf(SectionList);

  // Consumers keep the native ref and can request other rows/offsets unchanged.
  ref.current?.scrollToLocation({
    animated: false,
    itemIndex: 2,
    sectionIndex: 1,
    viewOffset: 7,
    viewPosition: 0.5,
  });
  expect(metrics.scrollToIndex).toHaveBeenLastCalledWith({
    animated: false,
    itemIndex: 2,
    sectionIndex: 1,
    index: 16,
    viewOffset: 65,
    viewPosition: 0.5,
  });
});

test.each([
  ['nonsticky', false, ['Row 13']],
  ['empty', true, []],
] as const)('%s sections keep navigation on their header cell', async (_, sticky, data) => {
  const metrics = measuredList();

  await renderList({ data: sections([...data]), stickySectionHeadersEnabled: sticky });
  metrics.scrollToIndex.mockClear();
  await fireEvent.press(screen.getByRole('button', { name: 'Second' }));
  expect(metrics.scrollToIndex).toHaveBeenLastCalledWith({
    animated: true,
    itemIndex: 0,
    sectionIndex: 1,
    index: 14,
    viewOffset: 0,
    viewPosition: 0,
  });
});

test('section data and sticky-header changes update the next tab navigation', async () => {
  type Props = { sections: Section[]; stickySectionHeadersEnabled: boolean };
  const scrollToLocation = jest.fn();
  const hook = await renderHook(
    (props: Props) =>
      useTabbedHeaderList<string, Section>({
        ...props,
        tabs: [{ title: 'First' }, { title: 'Second' }],
      }),
    { initialProps: { sections: sections(), stickySectionHeadersEnabled: true } }
  );

  hook.result.current.scrollViewRef.current = {
    scrollToLocation,
  } as unknown as SectionListRef<string, Section>;
  await act(() => hook.result.current.goToSection(1));
  expect(scrollToLocation).toHaveBeenLastCalledWith(expect.objectContaining({ itemIndex: 1 }));
  await hook.rerender({ sections: sections([]), stickySectionHeadersEnabled: true });
  await act(() => hook.result.current.goToSection(1));
  expect(scrollToLocation).toHaveBeenLastCalledWith(expect.objectContaining({ itemIndex: 0 }));
  await hook.rerender({ sections: sections(), stickySectionHeadersEnabled: false });
  await act(() => hook.result.current.goToSection(1));
  expect(scrollToLocation).toHaveBeenLastCalledWith(expect.objectContaining({ itemIndex: 0 }));
  await hook.rerender({ sections: sections(), stickySectionHeadersEnabled: true });
  await act(() => hook.result.current.goToSection(1));
  expect(scrollToLocation).toHaveBeenLastCalledWith(expect.objectContaining({ itemIndex: 1 }));
});
