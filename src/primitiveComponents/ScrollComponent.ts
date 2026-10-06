import type { ComponentRef } from 'react';
import type { FlatList, ScrollView, SectionList } from 'react-native';

/** Native instances inferred from each supported React Native component. */
export type ScrollViewRef = ComponentRef<typeof ScrollView>;
export type FlatListRef<ItemT = unknown> = ComponentRef<typeof FlatList<ItemT>>;
export type SectionListRef<ItemT = unknown, SectionT = unknown> = ComponentRef<
  typeof SectionList<ItemT, SectionT>
>;

// List methods are generic in their item type; retain that variance in this union.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ScrollComponent = ScrollViewRef | FlatListRef<any> | SectionListRef<any, any>;
