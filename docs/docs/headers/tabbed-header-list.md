---
sidebar_position: 2
---

# Tabbed Header List

![Tabbed Header List Gif](@site/static/img/assets/readme_TabbedHeaderList.gif)

## Example usage

These examples assume a `SafeAreaProvider` at the app root, as shown in the [installation guide](../introduction/installation.md).

Full source code can be found in [example repo](https://github.com/netguru/sticky-parallax-header/blob/master/example/src/screens/additionalExamples/TabbedHeaderListExample.tsx).

```tsx
import { Text } from 'react-native';
import { TabbedHeaderList } from 'react-native-sticky-parallax-header';

const sections = ['Trails', 'Campsites'].map((title) => ({
  key: title,
  title,
  data: Array.from({ length: 20 }, (_, index) => `${title} ${index + 1}`),
}));

export default function SectionsScreen() {
  return (
    <TabbedHeaderList
      containerStyle={{ flex: 1 }}
      backgroundColor="#22577a"
      title="Explore nearby"
      titleStyle={{ color: 'white' }}
      tabs={sections.map(({ title }) => ({ title }))}
      sections={sections}
      keyExtractor={(item) => item}
      renderItem={({ item }) => <Text style={{ padding: 24 }}>{item}</Text>}
      renderSectionHeader={({ section }) => (
        <Text style={{ padding: 16, backgroundColor: '#d8f3dc' }}>{section.title}</Text>
      )}
    />
  );
}
```

## Expanded header height

The predefined tabbed header uses a compact `parallaxHeight` based on the current
window dimensions, in density-independent pixels (dp):

```ts
const parallaxHeight =
  windowWidth > windowHeight && windowHeight <= 414
    ? 200
    : Math.min(320, Math.max(280, Math.round(windowHeight * 0.32)));
```

This gives short phone landscape windows a 200 dp default and other windows a
280–320 dp default. The value follows window changes, including rotation. Set
`parallaxHeight` explicitly, for example `parallaxHeight={400}`, when longer header
content or larger fonts need more room; an explicit value bypasses the default
calculation.

`headerHeight` still defaults to 100 dp. The underlying scroll height remains
`Math.max(parallaxHeight, headerHeight * 2)`, including when an explicit height is
provided.

## Props

Inherits [SectionListProps](https://reactnative.dev/docs/sectionlist#props)

| Prop                           | Type                                                | Default value          |
| ------------------------------ | --------------------------------------------------- | ---------------------- |
| backgroundColor                | color - `ColorValue` or `SharedValue<ColorValue>`   | -                      |
| backgroundImage                | image source - `ImageSourcePropType`                | -                      |
| containerStyle                 | style - `StyleProp<ViewStyle>`                      | -                      |
| enableSafeAreaTopInset         | boolean                                             | true                   |
| foregroundImage                | image source - `ImageSourcePropType`                | -                      |
| hasBorderRadius                | boolean                                             | -                      |
| headerHeight                   | number                                              | 100                    |
| logo                           | image source - `ImageSourcePropType`                | -                      |
| logoContainerStyle             | style - `StyleProp<ViewStyle>`                      | -                      |
| logoResizeMode                 | image resize mode - `ImageResizeMode`               | -                      |
| logoStyle                      | style - `StyleProp<ImageStyle>`                     | -                      |
| onHeaderLayout                 | function - `(e: LayoutChangeEvent) => void`         | -                      |
| onMomentumScrollBegin          | worklet function - `(e: NativeScrollEvent) => void` | -                      |
| onMomentumScrollEnd            | worklet function - `(e: NativeScrollEvent) => void` | -                      |
| onScroll                       | worklet function - `(e: NativeScrollEvent) => void` | -                      |
| onScrollBeginDrag              | worklet function - `(e: NativeScrollEvent) => void` | -                      |
| onScrollEndDrag                | worklet function - `(e: NativeScrollEvent) => void` | -                      |
| onTabsLayout                   | function - `(e: LayoutChangeEvent) => void`         | -                      |
| onTopReached                   | function - `() => void`                             | -                      |
| parallaxHeight                 | number                                              | Compact; see above     |
| renderHeaderBar                | render function                                     | -                      |
| snapStartThreshold             | number                                              | -                      |
| snapStopThreshold              | number                                              | -                      |
| snapToEdge                     | boolean                                             | true                   |
| stickyTabs                     | boolean                                             | true                   |
| tabTextActiveStyle             | style - `StyleProp<TextStyle>`                      | -                      |
| tabTextContainerStyle          | style - `StyleProp<ViewStyle>`                      | -                      |
| tabTextContainerActiveStyle    | style - `StyleProp<ViewStyle>`                      | -                      |
| tabTextStyle                   | style - `StyleProp<TextStyle>`                      | -                      |
| tabUnderlineColor              | color - `ColorValue` or `SharedValue<ColorValue>`   | -                      |
| tabWrapperStyle                | style - `StyleProp<ViewStyle>`                      | -                      |
| tabs                           | [Tabs](#tab) array - `Tab[]`                        | -                      |
| tabsContainerBackgroundColor   | color - `ColorValue` or `SharedValue<ColorValue>`   | -                      |
| tabsContainerHorizontalPadding | number                                              | 20                     |
| tabsContainerStyle             | style - `StyleProp<ViewStyle>`                      | -                      |
| title                          | string                                              | -                      |
| titleStyle                     | style = `StyleProp<TextStyle>`                      | -                      |
| titleTestID                    | string                                              | -                      |

### Tab

| Prop  | Type                                                 | Default value |
| ----- | ---------------------------------------------------- | ------------- |
| title | string                                               | -             |
| icon  | React Element or render function with isActive param | -             |

`Tab.testID` is an optional string passed to the tab control. Keep `tabs` in the same order as `sections`, and give every section a stable `key`.
