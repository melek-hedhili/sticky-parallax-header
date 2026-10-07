import { Link } from 'expo-router';
import type { Href } from 'expo-router';
import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { colors } from '@/showcase/constants';
import { homeScreenTestIDs } from '@/showcase/screens/home-screen/test-ids';

interface ExampleLinkProps {
  id: string;
  href: Href;
  label: string;
  testID: string;
}

export const EXAMPLES: ExampleLinkProps[] = [
  {
    id: 'yoda',
    href: '/showcase/yoda',
    label: 'Pager with Tabs and custom header bar (Yoda)',
    testID: homeScreenTestIDs.yodaLink,
  },
  {
    id: 'sims',
    href: '/showcase/sims',
    label: 'Custom sticky header component (Sims - AppStore)',
    testID: homeScreenTestIDs.simsLink,
  },
  {
    id: 'sticky-header-flat-list',
    href: '/showcase/sticky-header/flat-list',
    label: 'New StickyHeaderFlatList',
    testID: homeScreenTestIDs.stickyHeaderFlatListLink,
  },
  {
    id: 'sticky-header-scroll-view',
    href: '/showcase/sticky-header/scroll-view',
    label: 'New StickyHeaderScrollView',
    testID: homeScreenTestIDs.stickyHeaderScrollViewLink,
  },
  {
    id: 'sticky-header-section-list',
    href: '/showcase/sticky-header/section-list',
    label: 'New StickyHeaderSectionList',
    testID: homeScreenTestIDs.stickyHeaderSectionListLink,
  },
  {
    id: 'tabbed-header-list',
    href: '/showcase/tabbed-header/list',
    label: 'List with tabs',
    testID: homeScreenTestIDs.tabbedHeaderListLink,
  },
  {
    id: 'tabbed-header-pager',
    href: '/showcase/tabbed-header/pager',
    label: 'Pager with Tabs and logo',
    testID: homeScreenTestIDs.tabbedHeaderPagerLink,
  },
  {
    id: 'avatar-header-flat-list',
    href: '/showcase/avatar-header/flat-list',
    label: 'User Modal (FlatList)',
    testID: homeScreenTestIDs.avatarHeaderFlatListLink,
  },
  {
    id: 'avatar-header-scroll-view',
    href: '/showcase/avatar-header/scroll-view',
    label: 'User Modal (ScrollView)',
    testID: homeScreenTestIDs.avatarHeaderScrollViewLink,
  },
  {
    id: 'avatar-header-section-list',
    href: '/showcase/avatar-header/section-list',
    label: 'User Modal (SectionList)',
    testID: homeScreenTestIDs.avatarHeaderSectionListLink,
  },
  {
    id: 'details-header-flat-list',
    href: '/showcase/details-header/flat-list',
    label: 'Card Screen (FlatList)',
    testID: homeScreenTestIDs.detailsHeaderFlatListLink,
  },
  {
    id: 'details-header-scroll-view',
    href: '/showcase/details-header/scroll-view',
    label: 'Card Screen (ScrollView)',
    testID: homeScreenTestIDs.detailsHeaderScrollViewLink,
  },
  {
    id: 'details-header-section-list',
    href: '/showcase/details-header/section-list',
    label: 'Card Screen (SectionList)',
    testID: homeScreenTestIDs.detailsHeaderSectionListLink,
  },
  {
    id: 'tabbed-header-section-lists',
    href: '/showcase/tabbed-header/section-lists',
    label: 'Tabbed Header with SectionList tabs',
    testID: homeScreenTestIDs.tabbedHeaderWithSectionListsLink,
  },
  {
    id: 'tabbed-header-flash-list',
    href: '/showcase/tabbed-header/flash-list',
    label: 'FlashList with tabs',
    testID: homeScreenTestIDs.tabbedHeaderFlashListLink,
  },
  {
    id: 'avatar-header-flash-list',
    href: '/showcase/avatar-header/flash-list',
    label: 'User Modal (FlashList)',
    testID: homeScreenTestIDs.avatarHeaderFlashListLink,
  },
  {
    id: 'details-header-flash-list',
    href: '/showcase/details-header/flash-list',
    label: 'Card Screen (FlashList)',
    testID: homeScreenTestIDs.detailsHeaderFlashListLink,
  },
  {
    id: 'sticky-header-flash-list',
    href: '/showcase/sticky-header/flash-list',
    label: 'New StickyHeader (FlashList)',
    testID: homeScreenTestIDs.stickyHeaderFlashListLink,
  },
  {
    id: 'tabbed-header-animated-colors',
    href: '/showcase/tabbed-header/animated-colors',
    label: 'Pager with tabs and animated colors or styles',
    testID: homeScreenTestIDs.tabbedHeaderWithAnimatedColorsLink,
  },
];

export const ExampleLink: React.FC<ExampleLinkProps> = ({ href, label, testID }) => (
  <Link href={href} asChild>
    <TouchableOpacity testID={testID}>
      <Text style={styles.linkLabel}>{label}</Text>
    </TouchableOpacity>
  </Link>
);

const styles = StyleSheet.create({
  linkLabel: {
    color: colors.purplishBlue,
    fontFamily: 'AvertaStd-Semibold',
    fontSize: 20,
    padding: 10,
  },
});
