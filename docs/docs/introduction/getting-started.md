---
sidebar_position: 1
---

# Getting Started

`react-native-sticky-parallax-header` is a simple React Native library, enabling to create a fully custom header layout for your iOS, Android and web apps.

:::info Modern branch
These **Next** docs describe the React 19, New Architecture and Reanimated 4
migration in this repository. The version menu preserves the historical 1.0.x
and 0.4.x APIs. See [installation](./installation.md) for supported dependency
pairs and [migration](./modernization-guide.md) before updating an existing app.
:::

## Features

`react-native-sticky-parallax-header` provides two different type of components

- primitive components - components with sticky header setup
- predefined components - ready sticky header layouts

### Primitive components

Library exports following components:

- `StickyHeaderScrollView`
- `StickyHeaderFlatList`
- `StickyHeaderSectionList`

There is also possibility to create its own "sticky header" component, thanks to:

- `withStickyHeader` - HOC that wraps custom scroll component and sets up header & tabs layouts
- `useStickyHeaderScrollProps` - hook that sets up scroll props passed to custom "sticky header" component including "snap effect" props

### Predefined components

Library offers following header layout types:

|                             Tabbed Header                             |                             Avatar Header                             |                             Details Header                              |
| :-------------------------------------------------------------------: | :-------------------------------------------------------------------: | :---------------------------------------------------------------------: |
| ![Tabbed Header Gif](@site/static/img/assets/readme_TabbedHeader.gif) | ![Avatar Header Gif](@site/static/img/assets/readme_AvatarHeader.gif) | ![Details Header Gif](@site/static/img/assets/readme_DetailsHeader.gif) |

- `AvatarHeader(ScrollView|FlatList|SectionList)`
- `DetailsHeader(ScrollView|FlatList|SectionList)`
- `TabbedHeaderPager`
- `TabbedHeaderList`

### FlashList HOCs

Library also provides higher-order-components to enhance [FlashList](https://shopify.github.io/flash-list/docs/) with sticky header layouts:

- `withAvatarHeaderFlashList` (will produce FlashList equivalent of `AvatarHeader(FlashList|SectionList)`)
- `withDetailsHeaderFlashList` (will produce FlashList equivalent of `DetailsHeader(FlashList|SectionList)`)
- `withTabbedHeaderFlashList` (will produce FlashList equivalent of `TabbedHeaderList`)

As with primitive components, FlashList can also be customized to create its own "sticky header" layout, thanks to `withStickyHeaderFlashList` & `useStickyHeaderFlashListScrollProps`

FlashList is optional. Import its HOCs, hook and prop types from
`react-native-sticky-parallax-header/flash-list`, and install FlashList 2 in your
application. Core imports do not require FlashList.

## In Use

The repository contains an Expo application in `example/` and a separate React
Native application in `test-app/`. Each exercises the modern library with its
own supported dependency set.

The [original Expo Snack](https://snack.expo.dev/@netguru_rnd/sticky-parallax-header-example)
is a historical demonstration; it is not the modern compatibility reference.
