---
sidebar_position: 8
---

# Troubleshooting

These notes describe the current scoped package. Historical upstream reports
refer to older releases and do not establish a defect in the current version.

## Scroll callbacks and React state

`onScroll`, `onScrollBeginDrag`, `onScrollEndDrag`, `onMomentumScrollBegin` and
`onMomentumScrollEnd` run in Reanimated's UI runtime and receive a
`NativeScrollEvent` directly (`event.contentOffset`, without `nativeEvent`).
Declare callbacks as worklets. Update shared values there; use `scheduleOnRN`
for React state, navigation, logging or other JavaScript callbacks. `useCallback`
alone does not make a callback a worklet.

```tsx
import { useCallback, useState } from 'react';
import { type NativeScrollEvent, Text } from 'react-native';
import { scheduleOnRN } from 'react-native-worklets';
import { StickyHeaderScrollView } from '@mhedhili/react-native-sticky-parallax-header';

export function DragStatus() {
  const [dragging, setDragging] = useState(false);
  const onBeginDrag = useCallback((_event: NativeScrollEvent) => {
    'worklet';
    scheduleOnRN(setDragging, true);
  }, []);
  const onEndDrag = useCallback((_event: NativeScrollEvent) => {
    'worklet';
    scheduleOnRN(setDragging, false);
  }, []);

  return (
    <StickyHeaderScrollView
      containerStyle={{ flex: 1 }}
      onScrollBeginDrag={onBeginDrag}
      onScrollEndDrag={onEndDrag}>
      <Text style={{ minHeight: 1200 }}>{dragging ? 'Dragging' : 'Released'}</Text>
    </StickyHeaderScrollView>
  );
}
```

Layout callbacks, `onTopReached` and `onChangeTab` run on the React Native
JavaScript runtime. They do not need this transition. FlashList adapters use the
same worklet scroll callback contract. The wrappers dispatch lifecycle events
through their animated scroll handler; the native no-op listener props in the
implementation are deliberate and do not replace those consumer callbacks.
Momentum callbacks require a native momentum event; web has different event
support, as described in [web support](../introduction/web-support.md).

## Pager ref and page navigation

`TabbedHeaderPager` has two refs. Its top-level `ref` exposes the vertical
`ScrollView`; `pagerProps.ref` exposes `PagerMethods.goToPage`. Use a zero-based
page number corresponding to a child. See the complete
[typed pager ref example](./scrollview-reference.md#changing-the-horizontal-page).

Top-level scroll callbacks observe vertical scrolling. Callbacks inside
`pagerProps` observe horizontal paging and follow the same worklet contract.
Keep one `tabs` entry per child, in the same order.

## Tabs aligned to the start

The tab row distributes space and each tab grows by default. Override both
behaviors for content-sized tabs at the start:

```tsx
import type { TabbedHeaderPagerProps } from '@mhedhili/react-native-sticky-parallax-header';

export const startAlignedTabs = {
  tabsContainerStyle: { justifyContent: 'flex-start' },
  tabWrapperStyle: { flex: 0 },
} satisfies Pick<TabbedHeaderPagerProps, 'tabsContainerStyle' | 'tabWrapperStyle'>;
```

Spread `startAlignedTabs` onto a tabbed header. Use
`tabsContainerHorizontalPadding={0}` as well when no horizontal inset is wanted.
Changing `alignItems` alone controls the cross axis, not spacing along the row.

## Header props and snapping

- `subtitle` and `subtitleStyle` belong to Avatar and Details headers. `tag` and
  `tagStyle` belong to Details headers. Tabbed headers use `title` and
  `foregroundImage`. A custom `renderHeader` replaces the built-in foreground.
- `backgroundImage` is a React Native image source. In built-in layouts,
  `backgroundColor` is drawn over that image, so an opaque color can hide it.
  Without an image, `tabsContainerBackgroundColor` also colors the expanded
  foreground. With an image, that foreground stays transparent; tabbed headers
  still use the color for their tab bar.
- `pageContainerStyle` styles each horizontal page wrapper. It does not style the
  outer vertical scroll container. `disableScrollToPosition` disables vertical
  repositioning when changing pages; horizontal page navigation still works.
  `rememberTabScrollPosition` restores saved vertical offsets when repositioning
  is enabled.
- `snapToEdge` controls vertical header snapping in predefined headers and the
  snapping hooks. The primitive wrappers need the
  [hook wiring](../examples/custom-header.md). `snapStartThreshold` selects the
  decision boundary, while `snapStopThreshold` bounds the interval considered
  for snapping. The collapsed destination remains
  `Math.max(parallaxHeight, headerHeight * 2)`; `snapStopThreshold` is not a custom
  destination. Drag velocity also affects the decision. System Reduce Motion
  disables snapping, and web snapping is outside the compatibility contract.

## Custom content and list choice

Use `renderHeader` to replace the collapsing foreground, including custom PNG
placement. Use `renderHeaderBar` for the fixed bar. The
[custom header recipe](../examples/custom-header.md) shows shared scroll values
and snapping. For horizontal pages with a custom foreground, use
[`TabbedHeaderPager`](../headers/tabbed-header-pager.md) with `renderHeader`;
primitive `renderTabs` renders controls and leaves their navigation to the app.
See also [custom tabbed styling](../examples/custom-tabbed-header.md).

`renderHeader` is an absolute overlay measured to reserve content space. For a
large block that should scroll as ordinary list content, put it in the list's
`ListHeaderComponent` or data and keep the overlay compact. A full-screen custom
view may intercept touches; select `pointerEvents` for decorative views without
disabling interactive children. This is layout guidance, not a verified fix for
every tall-header gesture report. `headerContainerStyle` is not a supported prop;
`containerStyle` styles the whole component.

`TabbedHeaderList` navigates SectionList sections. `withTabbedHeaderFlashList`
navigates sticky indices in one flat list. Neither provides independent horizontal
FlashList pages. See the [FlashList contract and known iOS tab-jump limitation](../headers/flashlist-headers.md#tabbed-flashlist)
before choosing that adapter. Adding a horizontal FlashList pager requires a
separate design for nested scrolling, refs and saved offsets.

## Historical issue review — 2026-11-25

This source review compared all 13 reports below with the current implementation.
“Deferred” means no speculative runtime change was made. Source wiring and mocked
tests do not establish native gesture, rendering or UI-runtime behavior; this
review did not run a native build or validate these reports on devices.

| Upstream report | Current disposition and reason |
| --- | --- |
| [#420: FlashList begin callbacks](https://github.com/netguru/sticky-parallax-header/issues/420) | Already wired through the shared animated handler. Preserve the native listener workaround; a current native reproduction is needed before changing event plumbing. |
| [#409: tall custom header](https://github.com/netguru/sticky-parallax-header/issues/409) | Deferred gesture/layout investigation. The measured absolute overlay remains by design; changing touch ownership globally could break interactive headers. See the content guidance above. |
| [#355: FlashList pages](https://github.com/netguru/sticky-parallax-header/issues/355) | Deferred feature. Current tabbed FlashList is one vertical list; horizontal pages need a distinct contract. The existing iOS sticky-index jump remains a separate known limitation. |
| [#416: Avatar/Details props](https://github.com/netguru/sticky-parallax-header/issues/416) | Listed supported props are wired to their owning families. Documented family ownership and image/color conditions; no version or reproduction was supplied for further repair. |
| [#415: pager props](https://github.com/netguru/sticky-parallax-header/issues/415) | Current image, page styling and position flags are wired. Documented their scope and existing snap-threshold semantics; no unsupported behavior change without a reproduction. |
| [#381: header container styling](https://github.com/netguru/sticky-parallax-header/issues/381) | Deferred optional API feature. No `headerContainerStyle` exists; adding control over a measured overlay needs a concrete consumer requirement and layout validation. |
| [#414: frozen pager ref](https://github.com/netguru/sticky-parallax-header/issues/414) | Current pager scroll worklet captures its callback separately from `pagerProps`; the ref is assigned by the pager's imperative handle. Keep existing ref regression coverage; no further fix inferred from the old report. |
| [#412: missing goToPage](https://github.com/netguru/sticky-parallax-header/issues/412) | Usage correction: pass a typed ref through `pagerProps.ref`, not the vertical ref. Example linked above. |
| [#405: onScroll error](https://github.com/netguru/sticky-parallax-header/issues/405) | Usage correction: scroll callbacks must be worklets; schedule ordinary JavaScript work explicitly. Example above. |
| [#407: custom foreground with pages](https://github.com/netguru/sticky-parallax-header/issues/407) | Existing `TabbedHeaderPager` plus `renderHeader` supports this composition. Primitive `renderTabs` alone does not connect controls to content. No new pager API needed. |
| [#370: custom image placement](https://github.com/netguru/sticky-parallax-header/issues/370) | Existing `renderHeader` supports custom image layout; use the custom header recipe instead of adding another built-in image slot. |
| [#262: start-aligned tabs](https://github.com/netguru/sticky-parallax-header/issues/262) | Existing styles support this with row `justifyContent: 'flex-start'` and tab `flex: 0`. Both are shown above. |
| [#408: refresh under header](https://github.com/netguru/sticky-parallax-header/issues/408) | Focused correction preserves explicit list `progressViewOffset`; measured header height remains the default. Custom refresh controls and iOS layering still need platform-specific validation; see [pull to refresh](./pull-to-refresh.md). |
