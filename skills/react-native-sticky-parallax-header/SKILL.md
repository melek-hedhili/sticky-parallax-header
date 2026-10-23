---
name: react-native-sticky-parallax-header
description: Build, customize, troubleshoot, or migrate sticky and parallax headers with @mhedhili/react-native-sticky-parallax-header. Use when a React Native or Expo app needs the package's primitive, Avatar, Details, Tabbed, pager, SectionList, or FlashList APIs. Do not use for unrelated sticky-header libraries or for maintaining this package's internals.
license: MIT
---

# React Native Sticky Parallax Header

Help the user turn a visual, data, and interaction requirement into the smallest correct implementation using the package's public API.

## Workflow

1. Inspect the consumer app before changing it: package manager, Expo or bare React Native, installed versions, navigation and safe-area ownership, existing providers, data shape, target platforms, and local component conventions.
2. If installation, native setup, version compatibility, or an old API is involved, read [setup and migration](references/setup-and-migration.md).
3. Choose the simplest matching API from the table below. Prefer a predefined component when it satisfies the design; use primitives only for a genuinely custom layout.
4. Read only the reference for the selected family, plus [behavior and recipes](references/behavior-and-recipes.md) when the request involves worklets, snapping, bounce, refresh, animated colors, refs, navigation, RTL, or web.
5. Reuse the app's providers, styles, data types, and package manager. Import only from the package root or `/flash-list`; never import package internals.
6. Implement the complete screen or component, including required data/renderers, refs, accessibility labels, and platform guards. Do not add options or abstractions the request does not need.
7. Run the consumer app's relevant typecheck/tests and state which native or web behaviors still need runtime verification.

## Component selection

| Need | Public API | Read |
| --- | --- | --- |
| Free-form children with a ready profile layout | `AvatarHeaderScrollView` | [Avatar and Details](references/avatar-and-details.md) |
| Flat data with a ready profile layout | `AvatarHeaderFlatList` | [Avatar and Details](references/avatar-and-details.md) |
| Sectioned data with a ready profile layout | `AvatarHeaderSectionList` | [Avatar and Details](references/avatar-and-details.md) |
| Free-form, flat, or sectioned content with tag/count metadata | Matching `DetailsHeader*` variant | [Avatar and Details](references/avatar-and-details.md) |
| Tabs that navigate one `SectionList` | `TabbedHeaderList` | [Tabbed headers](references/tabbed.md) |
| Tabs that switch horizontal child pages | `TabbedHeaderPager` | [Tabbed headers](references/tabbed.md) |
| Fully custom header/tabs over a core RN scrollable | Matching `StickyHeader*`, usually with `useStickyHeaderScrollProps` | [Primitives](references/primitives.md) |
| Another compatible RN scroll component | `withStickyHeader` | [Primitives](references/primitives.md) |
| Any supported FlashList 2 layout | Matching HOC from `/flash-list` | [FlashList](references/flash-list.md) |

## Public entrypoints

The core entrypoint exports:

- `StickyHeaderScrollView`, `StickyHeaderFlatList`, `StickyHeaderSectionList`
- `useStickyHeaderProps`, `useStickyHeaderScrollProps`, `withStickyHeader`
- `StickyHeaderSharedProps`, `StickyHeaderSnapProps`, `StickyHeaderScrollViewProps`, `StickyHeaderFlatListProps`, `StickyHeaderSectionListProps`
- `AvatarHeaderScrollView`, `AvatarHeaderFlatList`, `AvatarHeaderSectionList`
- `AvatarHeaderSharedProps`, `AvatarHeaderScrollViewProps`, `AvatarHeaderFlatListProps`, `AvatarHeaderSectionListProps`
- `DetailsHeaderScrollView`, `DetailsHeaderFlatList`, `DetailsHeaderSectionList`
- `DetailsHeaderSharedProps`, `DetailsHeaderScrollViewProps`, `DetailsHeaderFlatListProps`, `DetailsHeaderSectionListProps`
- `TabbedHeaderList`, `TabbedHeaderPager`
- `PagerMethods`, `PagerProps`, `TabbedHeaderSharedProps`, `TabbedHeaderPagerProps`, `TabbedHeaderListProps`

The optional `/flash-list` entrypoint exports:

- `useStickyHeaderFlashListScrollProps`, `withStickyHeaderFlashList`
- `withAvatarHeaderFlashList`, `withDetailsHeaderFlashList`, `withTabbedHeaderFlashList`
- `StickyHeaderFlashListProps`, `AvatarHeaderFlashListProps`, `DetailsHeaderFlashListProps`, `TabbedHeaderFlashListProps`

Use the installed TypeScript declarations for inherited React Native and FlashList props. The bundled references document package-owned behavior, defaults, and constraints.

