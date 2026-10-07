import { FlashList } from '@shopify/flash-list';
import type { FlashListRef } from '@shopify/flash-list';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { FlatList, ScrollView, SectionList } from 'react-native';
import { Button, Platform, RefreshControl, StyleSheet, Text, View } from 'react-native';
import {
  AvatarHeaderFlatList,
  AvatarHeaderScrollView,
  AvatarHeaderSectionList,
  DetailsHeaderFlatList,
  DetailsHeaderScrollView,
  DetailsHeaderSectionList,
  StickyHeaderFlatList,
  StickyHeaderScrollView,
  StickyHeaderSectionList,
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

import type { ValidationCaseName } from '@/validation/catalogue';

const avatar = require('../../assets/validation/avatar.png');
const rows = Array.from({ length: 24 }, (_, i) => `Row ${i + 1}`);
const tabs = [
  { title: 'First', testID: 'tab-first' },
  { title: 'Second', testID: 'tab-second' },
];
const sections = tabs.map((tab, index) => ({
  key: tab.title,
  title: tab.title,
  data: rows.slice(index * 12, index * 12 + 12),
}));

type ScrollRef = React.ComponentRef<typeof ScrollView>;
type FlatRef = React.ComponentRef<typeof FlatList<string>>;
type SectionRef = React.ComponentRef<typeof SectionList<string>>;

const PrimitiveFlash = withStickyHeaderFlashList(FlashList);
const AvatarFlash = withAvatarHeaderFlashList<string>(FlashList);
const DetailsFlash = withDetailsHeaderFlashList<string>(FlashList);
const TabbedFlash = withTabbedHeaderFlashList<string>(FlashList);
const renderRow = ({ item }: { item: string }) => <Text style={styles.row}>{item}</Text>;
const renderHeader = () => (
  <View style={styles.header}>
    <Text style={styles.heading}>Measured header</Text>
  </View>
);
const renderTabs = () => (
  <View style={styles.tabs}>
    <Text>Sticky tabs</Text>
  </View>
);
const keyExtractor = (item: string) => item;

function scrollEvents<
  T extends { onScroll: unknown; onMomentumScrollEnd: unknown; onScrollEndDrag: unknown },
>(value: T): Pick<T, 'onScroll' | 'onMomentumScrollEnd' | 'onScrollEndDrag'> {
  return {
    onScroll: value.onScroll,
    onMomentumScrollEnd: value.onMomentumScrollEnd,
    onScrollEndDrag: value.onScrollEndDrag,
  };
}

export function ValidationFixture({ name }: { name: ValidationCaseName }) {
  const children = rows.map((item) => (
    <Text key={item} style={styles.row}>
      {item}
    </Text>
  ));
  const [status, setStatus] = useState('Ready');
  const [refreshing, setRefreshing] = useState(false);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (refreshTimer.current !== null) {
        clearTimeout(refreshTimer.current);
      }
    },
    []
  );
  const scrollToStart = useRef<(() => void) | null>(null);
  const pagerRef = useRef<PagerMethods>(null);
  const onTopReached = useCallback(() => setStatus('Top reached'), []);
  const snap = useStickyHeaderScrollProps<ScrollRef>({
    parallaxHeight: 220,
    headerHeight: 64,
    onTopReached,
  });
  const flatSnap = useStickyHeaderScrollProps<FlatRef>({
    parallaxHeight: 220,
    headerHeight: 64,
    onTopReached,
  });
  const sectionSnap = useStickyHeaderScrollProps<SectionRef>({
    parallaxHeight: 220,
    headerHeight: 64,
    onTopReached,
  });
  const flashSnap = useStickyHeaderFlashListScrollProps<FlashListRef<string>>({
    parallaxHeight: 220,
    headerHeight: 64,
    onTopReached,
  });
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setStatus('Refreshing');
    if (refreshTimer.current !== null) {
      clearTimeout(refreshTimer.current);
    }

    refreshTimer.current = setTimeout(() => {
      refreshTimer.current = null;
      setRefreshing(false);
      setStatus('Refresh complete');
    }, 400);
  }, []);
  const common = {
    title: name,
    titleTestID: 'fixture-title',
    subtitle: 'Local deterministic content',
    backgroundColor: colors.header,
    image: avatar,
    foregroundImage: avatar,
    parallaxHeight: 220,
    headerHeight: 64,
    enableSafeAreaTopInset: false,
    containerStyle: styles.fill,
    contentContainerStyle: styles.content,
    titleStyle: styles.heading,
    onTopReached,
    refreshControl:
      Platform.OS === 'web' ? undefined : (
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      ),
  };
  const primitive = {
    renderHeader,
    renderTabs,
    containerStyle: styles.fill,
    refreshControl: common.refreshControl,
  };
  const scrollRef = (node: ScrollRef | null) => {
    scrollToStart.current = () => node?.scrollTo({ y: 0, animated: true });
  };
  const flatRef = (node: FlatRef | null) => {
    scrollToStart.current = () => node?.scrollToOffset({ offset: 0, animated: true });
  };
  const sectionRef = (node: SectionRef | null) => {
    scrollToStart.current = () =>
      node?.scrollToLocation({ sectionIndex: 0, itemIndex: 0, animated: true });
  };
  const flashRef = (node: FlashListRef<string> | null) => {
    scrollToStart.current = () => node?.scrollToOffset({ offset: 0, animated: true });
  };
  let content: React.ReactNode;

  switch (name) {
    case 'Primitive ScrollView':
      scrollToStart.current = () => snap.scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      content = (
        <StickyHeaderScrollView {...primitive} {...scrollEvents(snap)} ref={snap.scrollViewRef}>
          {children}
        </StickyHeaderScrollView>
      );
      break;
    case 'Primitive FlatList':
      scrollToStart.current = () =>
        flatSnap.scrollViewRef.current?.scrollToOffset({ offset: 0, animated: true });
      content = (
        <StickyHeaderFlatList
          {...primitive}
          {...scrollEvents(flatSnap)}
          ref={flatSnap.scrollViewRef}
          data={rows}
          renderItem={renderRow}
          keyExtractor={keyExtractor}
        />
      );
      break;
    case 'Primitive SectionList':
      scrollToStart.current = () =>
        sectionSnap.scrollViewRef.current?.scrollToLocation({
          sectionIndex: 0,
          itemIndex: 0,
          animated: true,
        });
      content = (
        <StickyHeaderSectionList
          {...primitive}
          {...scrollEvents(sectionSnap)}
          ref={sectionSnap.scrollViewRef}
          sections={sections}
          renderItem={renderRow}
          keyExtractor={keyExtractor}
        />
      );
      break;
    case 'Avatar ScrollView':
      content = (
        <AvatarHeaderScrollView {...common} ref={scrollRef}>
          {children}
        </AvatarHeaderScrollView>
      );
      break;
    case 'Avatar FlatList':
      content = (
        <AvatarHeaderFlatList
          {...common}
          ref={flatRef}
          data={rows}
          renderItem={renderRow}
          keyExtractor={keyExtractor}
        />
      );
      break;
    case 'Avatar SectionList':
      content = (
        <AvatarHeaderSectionList
          {...common}
          ref={sectionRef}
          sections={sections}
          renderItem={renderRow}
          keyExtractor={keyExtractor}
        />
      );
      break;
    case 'Details ScrollView':
      content = (
        <DetailsHeaderScrollView {...common} ref={scrollRef}>
          {children}
        </DetailsHeaderScrollView>
      );
      break;
    case 'Details FlatList':
      content = (
        <DetailsHeaderFlatList
          {...common}
          ref={flatRef}
          data={rows}
          renderItem={renderRow}
          keyExtractor={keyExtractor}
        />
      );
      break;
    case 'Details SectionList':
      content = (
        <DetailsHeaderSectionList
          {...common}
          ref={sectionRef}
          sections={sections}
          renderItem={renderRow}
          keyExtractor={keyExtractor}
        />
      );
      break;
    case 'Tabbed SectionList':
      content = (
        <TabbedHeaderList
          initialNumToRender={rows.length + sections.length * 2}
          {...common}
          ref={sectionRef}
          tabs={tabs}
          sections={sections}
          renderItem={renderRow}
          keyExtractor={keyExtractor}
          renderSectionHeader={({ section }) => <Text style={styles.tabs}>{section.title}</Text>}
        />
      );
      break;
    case 'Tabbed Pager':
      content = (
        <TabbedHeaderPager
          {...common}
          ref={scrollRef}
          tabs={tabs}
          rememberTabScrollPosition
          pagerProps={{ ref: pagerRef }}
          onChangeTab={(_, page) => setStatus(`Page ${page + 1}`)}>
          <View>{children}</View>
          <View>
            {rows.map((item) => (
              <Text style={styles.row} key={item}>
                Second {item}
              </Text>
            ))}
          </View>
        </TabbedHeaderPager>
      );
      break;
    case 'Primitive FlashList':
      scrollToStart.current = () =>
        flashSnap.scrollViewRef.current?.scrollToOffset({ offset: 0, animated: true });
      content = (
        <PrimitiveFlash
          {...primitive}
          {...scrollEvents(flashSnap)}
          ref={flashSnap.scrollViewRef}
          data={rows}
          renderItem={renderRow}
          keyExtractor={keyExtractor}
        />
      );
      break;
    case 'Avatar FlashList':
      content = (
        <AvatarFlash
          {...common}
          ref={flashRef}
          data={rows}
          renderItem={renderRow}
          keyExtractor={keyExtractor}
        />
      );
      break;
    case 'Details FlashList':
      content = (
        <DetailsFlash
          {...common}
          ref={flashRef}
          data={rows}
          renderItem={renderRow}
          keyExtractor={keyExtractor}
        />
      );
      break;
    case 'Tabbed FlashList':
      content = (
        <TabbedFlash
          {...common}
          ref={flashRef}
          tabs={tabs}
          data={rows}
          stickyHeaderIndices={[0, 12]}
          renderItem={renderRow}
          keyExtractor={keyExtractor}
        />
      );
      break;
  }

  return (
    <View style={styles.fill}>
      <View style={styles.controls}>
        <Button
          title="Scroll to top"
          testID="scroll-to-top"
          onPress={() => scrollToStart.current?.()}
        />
        <Button title="Refresh" testID="refresh" onPress={onRefresh} />
        {name === 'Tabbed Pager' && (
          <Button
            title="Second page"
            testID="second-page"
            onPress={() => pagerRef.current?.goToPage(1)}
          />
        )}
      </View>
      <Text testID="fixture-status" style={styles.status}>
        {status}
      </Text>
      {content}
    </View>
  );
}

const colors = { background: '#ffffff', header: '#17494d', border: '#d4dedf', tabs: '#d3efdf' };

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.background },
  content: { backgroundColor: colors.background },
  controls: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  heading: { color: colors.background, fontSize: 24 },
  header: {
    height: 220,
    backgroundColor: colors.header,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    minHeight: 88,
    padding: 24,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  status: { padding: 8, textAlign: 'center' },
  tabs: { padding: 18, backgroundColor: colors.tabs, fontSize: 18 },
});
