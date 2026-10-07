---
sidebar_position: 5
---

# Web support

The Expo Router demo includes a React Native Web target. Use the Expo-supported
React Native Web version for that application and keep React and React DOM on
the same version.

Two platform boundaries remain part of the library's behavior:

- Native snap-to-edge behavior is disabled on web. Scroll and header animation
  still operate; web does not share the native drag/momentum event contract.
- Native pull-to-refresh is excluded on web. Omit refresh props as described in
  [pull to refresh](../guides/pull-to-refresh.md), and provide a separate refresh
  interaction when needed.

The library uses a debounced web scroll path to detect when scrolling stops.
Test tab presses, horizontal paging, responsive widths and RTL in a browser in
addition to validating the native applications. A successful web export proves
bundling, not smooth scrolling or gesture behavior.
