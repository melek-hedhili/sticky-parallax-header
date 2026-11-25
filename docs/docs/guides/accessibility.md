---
sidebar_position: 7
---

# Accessibility and reduced motion

The current implementation follows the system Reduce Motion preference and live
changes to it. No additional public motion prop is required. This applies to
primitives, predefined headers, and the optional FlashList entrypoint. On web,
React Native Web reports the browser's `prefers-reduced-motion` preference.

## Motion behavior

With Reduce Motion enabled, the library disables its elastic pull/stretch,
decorative image scaling and fades, and automatic snap-to-edge. Ordinary scrolling,
header collapse, sticky tabs, refresh, and consumer scroll callbacks remain active.
Native `bounces` and overscroll remain the scrollable and operating system's
responsibility.

Built-in tab selection and imperative pager navigation reach the same section or
page without an animated scroll. Remembered pager offsets still restore their
destination. Calls made directly through your scroll ref belong to your app: pass
`animated: false` when appropriate. Custom worklets, renderers, colors, and app
navigation animations also need their own preference handling.

## Screen readers

When VoiceOver or TalkBack is active on native platforms, built-in headers keep
their fixed text summary visible and available as a heading while the header
collapses. Avatar summarizes its title/subtitle; Details includes its tag, title,
subtitle and count (including zero); Tabbed summarizes its title. Duplicate
built-in foreground text is hidden from assistive technology when the built-in
summary is available. Header action buttons remain separate controls. Give icon
actions descriptive `leftTopIconAccessibilityLabel` and
`rightTopIconAccessibilityLabel` values.

Built-in tabs expose the tab role and selected state. In the horizontal pager,
rendered inactive pages are hidden from the accessibility tree; web also makes
them inert. Selection makes the destination page available. Hiding does not
conditionally unmount those pages. Existing FlatList virtualization still applies;
keep state needed beyond its render window outside page cells. SectionList and
FlashList tabs navigate one continuous list; they do not hide other sections.
Browser screen reader activation is not detected as
native reader mode by React Native Web; validate browser semantics independently.

Custom `renderHeader`, `renderHeaderBar`, `renderTabs`, tab icons, and mixed custom
and built-in layouts remain app-owned. Supply headings, labels, selected states,
focus behavior and sensible contrast. A custom header bar does not automatically
hide the built-in foreground: this avoids losing text when the custom bar omits a
summary. Avoid making an entire header accessible as one group when it contains
independent actions. Test large text, long titles, RTL and your own safe-area layout.

## Custom renderer example

Use React Native's public
[`AccessibilityInfo`](https://reactnative.dev/docs/accessibilityinfo) API in app
code. Subscribe before reading the initial value; a late initial result must not
overwrite a newer change event. Remove the subscription when unmounting. This
example keeps a custom foreground static until the preference is known:

```tsx
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';
import { StickyHeaderScrollView } from '@mhedhili/react-native-sticky-parallax-header';

function useReduceMotion() {
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    let active = true;
    let changed = false;
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      changed = true;
      if (active) setReduceMotion(enabled);
    });

    void AccessibilityInfo.isReduceMotionEnabled().then(
      (enabled) => {
        if (active && !changed) setReduceMotion(enabled);
      },
      () => {} // Keep the static fallback if the platform cannot read the preference.
    );

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}

export function CustomHeader() {
  const reduceMotion = useReduceMotion();

  return (
    <StickyHeaderScrollView
      containerStyle={{ flex: 1 }}
      renderHeader={() => (
        <View style={{ height: 240, padding: 24 }}>
          <Text accessibilityRole="header">Field notes</Text>
          <Text>{reduceMotion ? 'Static artwork' : 'Optional app-owned animated artwork'}</Text>
        </View>
      )}>
      <Text style={{ minHeight: 1000, padding: 24 }}>Your accessible content</Text>
    </StickyHeaderScrollView>
  );
}
```

Use the same subscribe/read/cleanup pattern for `screenReaderChanged` and
`isScreenReaderEnabled()` when a custom native design needs a stable summary.
Keep the information available before detection completes. See React Native's
[accessibility properties](https://reactnative.dev/docs/accessibility) for
platform-specific semantics. A custom web renderer should also honor the browser's
`prefers-reduced-motion` setting.

## Validation scope

The Expo demo's validation fixtures include named header actions, Details metadata
with a zero count, long content, and editable pager notes for checking preserved
page state. Use the OS settings, toggle preferences while a fixture remains
mounted, then test expanded, partially collapsed, and collapsed states. There is
no demo override of the system preference.

Mocked tests establish listener cleanup, animation decisions and semantic props;
they do not prove native worklet timing, VoiceOver/TalkBack focus order, spoken
announcements, or browser keyboard behavior. Validate those with the actual
assistive technology on each supported platform. Expo Go evidence applies to its
SDK/native dependency pair, not every accepted peer combination. The existing
[web limitations](../introduction/web-support.md) still apply.
