import { FlashList } from '@shopify/flash-list';
import type { FlashListRef } from '@shopify/flash-list';
import React, { useCallback, useRef, useState } from 'react';
import type { ScrollView } from 'react-native';
import { Button, StyleSheet, Text, View } from 'react-native';
import {
  AvatarHeaderFlatList,
  DetailsHeaderFlatList,
  StickyHeaderScrollView,
  TabbedHeaderList,
  TabbedHeaderPager,
  useStickyHeaderScrollProps,
} from 'react-native-sticky-parallax-header';
import type { PagerMethods } from 'react-native-sticky-parallax-header';
import {
  useStickyHeaderFlashListScrollProps,
  withAvatarHeaderFlashList,
  withDetailsHeaderFlashList,
  withStickyHeaderFlashList,
  withTabbedHeaderFlashList,
} from 'react-native-sticky-parallax-header/flash-list';

import type { PerformanceScenarioName } from '@/performance/catalogue';

const image = require('../../assets/validation/avatar.png');
const rows = Array.from({ length: 240 }, (_, index) => `Row ${index + 1}`);
const tabs = Array.from({ length: 6 }, (_, index) => ({ title: `Page ${index + 1}` }));
const sections = tabs.map((tab, index) => ({
  key: tab.title,
  title: tab.title,
  data: rows.slice(index * 40, (index + 1) * 40),
}));

type Counters = { top: number; pageChanges: number; pageMounts: number; pageUnmounts: number };

const PrimitiveFlash = withStickyHeaderFlashList(FlashList);
const AvatarFlash = withAvatarHeaderFlashList<string>(FlashList);
const DetailsFlash = withDetailsHeaderFlashList<string>(FlashList);
const TabbedFlash = withTabbedHeaderFlashList<string>(FlashList);
const renderItem = ({ item }: { item: string }) => <Text style={styles.row}>{item}</Text>;
const keyExtractor = (item: string) => item;
const renderHeader = () => <View style={styles.header} />;

function Primitive({ onTopReached }: { onTopReached: () => void }) {
  const scroll = useStickyHeaderScrollProps<React.ComponentRef<typeof ScrollView>>({
    parallaxHeight: 280,
    headerHeight: 100,
    onTopReached,
  });

  return (
    <StickyHeaderScrollView
      ref={scroll.scrollViewRef}
      renderHeader={renderHeader}
      onScroll={scroll.onScroll}
      onScrollEndDrag={scroll.onScrollEndDrag}
      onMomentumScrollEnd={scroll.onMomentumScrollEnd}>
      {rows.map((item) => (
        <Text key={item} style={styles.row}>
          {item}
        </Text>
      ))}
    </StickyHeaderScrollView>
  );
}

function PrimitiveFlashScene({ onTopReached }: { onTopReached: () => void }) {
  const scroll = useStickyHeaderFlashListScrollProps<FlashListRef<string>>({
    parallaxHeight: 280,
    headerHeight: 100,
    onTopReached,
  });

  return (
    <PrimitiveFlash
      ref={scroll.scrollViewRef}
      renderHeader={renderHeader}
      data={rows}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onScroll={scroll.onScroll}
      onScrollEndDrag={scroll.onScrollEndDrag}
      onMomentumScrollEnd={scroll.onMomentumScrollEnd}
    />
  );
}

function Page({ index, counters }: { index: number; counters: React.RefObject<Counters> }) {
  React.useEffect(() => {
    const current = counters.current;

    current.pageMounts += 1;

    return () => {
      current.pageUnmounts += 1;
    };
  }, [counters]);

  return (
    <View>
      {rows.map((item) => (
        <Text key={item} style={styles.row}>
          Page {index + 1}: {item}
        </Text>
      ))}
    </View>
  );
}

export function PerformanceScene({ scenario }: { scenario: PerformanceScenarioName }) {
  const counters = useRef<Counters>({ top: 0, pageChanges: 0, pageMounts: 0, pageUnmounts: 0 });
  const pagerRef = useRef<PagerMethods>(null);
  const [report, setReport] = useState('Counters are sampled only when requested.');
  const onTopReached = useCallback(() => {
    counters.current.top += 1;
  }, []);
  const onChangeTab = useCallback(() => {
    counters.current.pageChanges += 1;
  }, []);
  const common = {
    title: scenario,
    subtitle: 'Fixed local benchmark content',
    image,
    foregroundImage: image,
    backgroundColor: colors.header,
    parallaxHeight: 280,
    headerHeight: 100,
    onTopReached,
  };
  const list = { data: rows, renderItem, keyExtractor };
  let content: React.ReactNode;

  switch (scenario) {
    case 'Primitive':
      content = <Primitive onTopReached={onTopReached} />;
      break;
    case 'Primitive FlashList':
      content = <PrimitiveFlashScene onTopReached={onTopReached} />;
      break;
    case 'Avatar':
      content = <AvatarHeaderFlatList {...common} {...list} />;
      break;
    case 'Avatar FlashList':
      content = <AvatarFlash {...common} {...list} />;
      break;
    case 'Details':
      content = <DetailsHeaderFlatList {...common} {...list} />;
      break;
    case 'Details FlashList':
      content = <DetailsFlash {...common} {...list} />;
      break;
    case 'Tabbed SectionList':
      content = (
        <TabbedHeaderList {...common} tabs={tabs} sections={sections} renderItem={renderItem} />
      );
      break;
    case 'Tabbed FlashList':
      content = (
        <TabbedFlash
          {...common}
          {...list}
          tabs={tabs}
          stickyHeaderIndices={[0, 40, 80, 120, 160, 200]}
        />
      );
      break;
    case 'Pager':
      content = (
        <TabbedHeaderPager
          {...common}
          tabs={tabs}
          pagerProps={{ ref: pagerRef }}
          onChangeTab={onChangeTab}
          rememberTabScrollPosition>
          {tabs.map((tab, index) => (
            <Page key={tab.title} index={index} counters={counters} />
          ))}
        </TabbedHeaderPager>
      );
      break;
  }

  return (
    <View style={styles.fill}>
      <View style={styles.controls}>
        <Button
          title="Sample counters"
          testID="performance-sample"
          onPress={() => setReport(JSON.stringify(counters.current))}
        />
        {scenario === 'Pager' && (
          <Button
            title="Second page"
            testID="performance-second-page"
            onPress={() => pagerRef.current?.goToPage(1)}
          />
        )}
      </View>
      <Text style={styles.report} testID="performance-counters">
        {report}
      </Text>
      {content}
    </View>
  );
}

const colors = { header: '#17494d', background: '#ffffff', border: '#d4dedf' };
const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.background },
  controls: { flexDirection: 'row', justifyContent: 'center' },
  report: { height: 44, padding: 4, fontSize: 12 },
  row: {
    minHeight: 88,
    padding: 24,
    fontSize: 18,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  header: { height: 280, backgroundColor: colors.header },
});
