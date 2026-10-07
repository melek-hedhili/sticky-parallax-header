---
sidebar_position: 1
---

# Tabbed Header Pager

![Tabbed Header Gif](@site/static/img/assets/readme_Tabbed.gif)

## Example usage

These examples assume a `SafeAreaProvider` at the app root, as shown in the [installation guide](../introduction/installation.md).

Full source code can be found in [example repo](https://github.com/netguru/sticky-parallax-header/blob/master/demo/src/showcase/screens/additional-examples/tabbed-header-pager-example.tsx).

```tsx
import { Text, View } from 'react-native';
import { TabbedHeaderPager } from 'react-native-sticky-parallax-header';

const tabs = [{ title: 'Overview' }, { title: 'Notes' }];

export default function PagerScreen() {
  return (
    <TabbedHeaderPager
      containerStyle={{ flex: 1 }}
      backgroundColor="#22577a"
      title="Field notes"
      titleStyle={{ color: 'white' }}
      rememberTabScrollPosition
      tabs={tabs}>
      {tabs.map(({ title }) => (
        <View key={title} style={{ minHeight: 1200, padding: 24 }}>
          <Text>{title}</Text>
        </View>
      ))}
    </TabbedHeaderPager>
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

Inherits [ScrollViewProps](https://reactnative.dev/docs/scrollview#props)

| Prop                           | Type                                                     | Default value          |
| ------------------------------ | -------------------------------------------------------- | ---------------------- |
| backgroundColor                | color - `ColorValue` or `SharedValue<ColorValue>`        | -                      |
| backgroundImage                | image source - `ImageSourcePropType`                     | -                      |
| containerStyle                 | style - `StyleProp<ViewStyle>`                           | -                      |
| disableScrollToPosition        | boolean                                                  | -                      |
| enableSafeAreaTopInset         | boolean                                                  | true                   |
| foregroundImage                | image source - `ImageSourcePropType`                     | -                      |
| hasBorderRadius                | boolean                                                  | -                      |
| headerHeight                   | number                                                   | 100                    |
| initialPage                    | number                                                   | 0                      |
| logo                           | image source - `ImageSourcePropType`                     | -                      |
| logoContainerStyle             | style - `StyleProp<ViewStyle>`                           | -                      |
| logoResizeMode                 | image resize mode - `ImageResizeMode`                    | -                      |
| logoStyle                      | style - `StyleProp<ImageStyle>`                          | -                      |
| onChangeTab                    | function - `(prevPage: number, newPage: number) => void` | -                      |
| onHeaderLayout                 | function - `(e: LayoutChangeEvent) => void`              | -                      |
| onMomentumScrollBegin          | worklet function - `(e: NativeScrollEvent) => void`      | -                      |
| onMomentumScrollEnd            | worklet function - `(e: NativeScrollEvent) => void`      | -                      |
| onScroll                       | worklet function - `(e: NativeScrollEvent) => void`      | -                      |
| onScrollBeginDrag              | worklet function - `(e: NativeScrollEvent) => void`      | -                      |
| onScrollEndDrag                | worklet function - `(e: NativeScrollEvent) => void`      | -                      |
| onTabsLayout                   | function - `(e: LayoutChangeEvent) => void`              | -                      |
| onTopReached                   | function - `() => void`                                  | -                      |
| pageContainerStyle             | style - `StyleProp<ViewStyle>`                           | -                      |
| pagerProps                     | [pager props](#pagerprops) - `PagerProps`                | -                      |
| parallaxHeight                 | number                                                   | Compact; see above     |
| rememberTabScrollPosition      | boolean                                                  | -                      |
| renderHeaderBar                | render function                                          | -                      |
| snapStartThreshold             | number                                                   | -                      |
| snapStopThreshold              | number                                                   | -                      |
| snapToEdge                     | boolean                                                  | true                   |
| stickyTabs                     | boolean                                                  | true                   |
| tabTextActiveStyle             | style - `StyleProp<TextStyle>`                           | -                      |
| tabTextContainerStyle          | style - `StyleProp<ViewStyle>`                           | -                      |
| tabTextContainerActiveStyle    | style - `StyleProp<ViewStyle>`                           | -                      |
| tabTextStyle                   | style - `StyleProp<TextStyle>`                           | -                      |
| tabUnderlineColor              | color - `ColorValue` or `SharedValue<ColorValue>`        | -                      |
| tabWrapperStyle                | style - `StyleProp<ViewStyle>`                           | -                      |
| tabs                           | [Tabs](#tab) array - `Tab[]`                             | -                      |
| tabsContainerBackgroundColor   | color - `ColorValue` or `SharedValue<ColorValue>`        | -                      |
| tabsContainerHorizontalPadding | number                                                   | 20                     |
| tabsContainerStyle             | style - `StyleProp<ViewStyle>`                           | -                      |
| title                          | string                                                   | -                      |
| titleStyle                     | style = `StyleProp<TextStyle>`                           | -                      |
| titleTestID                    | string                                                   | -                      |

### Tab

| Prop   | Type                                                 | Default value |
| ------ | ---------------------------------------------------- | ------------- |
| title  | string                                               | -             |
| icon   | React Element or render function with isActive param | -             |
| testID | string                                               | -             |

### PagerProps

Wraps [FlatListProps](https://reactnative.dev/docs/flatlist#props) for horizontal paging, with data and rendering managed by the component.

| Prop                  | Type                                                | Default value |
| --------------------- | --------------------------------------------------- | ------------- |
| onMomentumScrollBegin | worklet function - `(e: NativeScrollEvent) => void` | -             |
| onMomentumScrollEnd   | worklet function - `(e: NativeScrollEvent) => void` | -             |
| onScroll              | worklet function - `(e: NativeScrollEvent) => void` | -             |
| onScrollBeginDrag     | worklet function - `(e: NativeScrollEvent) => void` | -             |
| onScrollEndDrag       | worklet function - `(e: NativeScrollEvent) => void` | -             |

Methods:

| Function | Type                                      |
| -------- | ----------------------------------------- |
| goToPage | function - `(pageNumber: number) => void` |
