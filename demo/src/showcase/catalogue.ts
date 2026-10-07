import type { Href } from 'expo-router';

export type ShowcaseEntry = { id: string; label: string; href: Href };

export const SHOWCASE_CATALOGUE = [
  { id: 'home', label: 'Quiz showcase', href: '/showcase' },
  {
    id: 'card',
    label: 'Quiz cards',
    href: { pathname: '/showcase/card/[user-id]', params: { 'user-id': 'brandon' } },
  },
  { id: 'sims', label: 'Custom sticky header (Sims)', href: '/showcase/sims' },
  { id: 'yoda', label: 'Custom tabbed header (Yoda)', href: '/showcase/yoda' },
  {
    id: 'sticky-header-flat-list',
    label: 'StickyHeaderFlatList',
    href: '/showcase/sticky-header/flat-list',
  },
  {
    id: 'sticky-header-scroll-view',
    label: 'StickyHeaderScrollView',
    href: '/showcase/sticky-header/scroll-view',
  },
  {
    id: 'sticky-header-section-list',
    label: 'StickyHeaderSectionList',
    href: '/showcase/sticky-header/section-list',
  },
  {
    id: 'avatar-header-flat-list',
    label: 'AvatarHeaderFlatList',
    href: '/showcase/avatar-header/flat-list',
  },
  {
    id: 'avatar-header-scroll-view',
    label: 'AvatarHeaderScrollView',
    href: '/showcase/avatar-header/scroll-view',
  },
  {
    id: 'avatar-header-section-list',
    label: 'AvatarHeaderSectionList',
    href: '/showcase/avatar-header/section-list',
  },
  {
    id: 'details-header-flat-list',
    label: 'DetailsHeaderFlatList',
    href: '/showcase/details-header/flat-list',
  },
  {
    id: 'details-header-scroll-view',
    label: 'DetailsHeaderScrollView',
    href: '/showcase/details-header/scroll-view',
  },
  {
    id: 'details-header-section-list',
    label: 'DetailsHeaderSectionList',
    href: '/showcase/details-header/section-list',
  },
  { id: 'tabbed-header-list', label: 'Tabbed header list', href: '/showcase/tabbed-header/list' },
  {
    id: 'tabbed-header-pager',
    label: 'Tabbed header pager',
    href: '/showcase/tabbed-header/pager',
  },
  {
    id: 'tabbed-header-section-lists',
    label: 'Pager with SectionList tabs',
    href: '/showcase/tabbed-header/section-lists',
  },
  {
    id: 'tabbed-header-flash-list',
    label: 'Tabbed header FlashList',
    href: '/showcase/tabbed-header/flash-list',
  },
  {
    id: 'tabbed-header-animated-colors',
    label: 'Animated tabbed header colors',
    href: '/showcase/tabbed-header/animated-colors',
  },
  {
    id: 'avatar-header-flash-list',
    label: 'AvatarHeaderFlashList',
    href: '/showcase/avatar-header/flash-list',
  },
  {
    id: 'details-header-flash-list',
    label: 'DetailsHeaderFlashList',
    href: '/showcase/details-header/flash-list',
  },
  {
    id: 'sticky-header-flash-list',
    label: 'StickyHeaderFlashList',
    href: '/showcase/sticky-header/flash-list',
  },
] satisfies ShowcaseEntry[];
