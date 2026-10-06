---
sidebar_position: 3
---

# Details Header

![Details Header Gif](@site/static/img/assets/readme_Details.gif)

## Example usage

These examples assume a `SafeAreaProvider` at the app root, as shown in the [installation guide](../introduction/installation.md).

Check out DetailsHeader examples for [ScrollView](https://github.com/netguru/sticky-parallax-header/blob/master/example/src/screens/additionalExamples/DetailsHeaderScrollViewExample.tsx), [FlatList](https://github.com/netguru/sticky-parallax-header/blob/master/example/src/screens/additionalExamples/DetailsHeaderFlatListExample.tsx), [SectionList](https://github.com/netguru/sticky-parallax-header/blob/master/example/src/screens/additionalExamples/DetailsHeaderSectionListExample.tsx) & [FlashList](https://github.com/netguru/sticky-parallax-header/blob/master/example/src/screens/additionalExamples/DetailsHeaderFlashListExample.tsx)

```tsx
import { Text, View } from 'react-native';
import { DetailsHeaderScrollView } from 'react-native-sticky-parallax-header';

export default function DetailsScreen() {
  return (
    <DetailsHeaderScrollView
      containerStyle={{ flex: 1 }}
      backgroundColor="#22577a"
      tag="Travel"
      title="A weekend outdoors"
      titleStyle={{ color: 'white' }}
      hasBorderRadius>
      <View style={{ padding: 24 }}>
        {Array.from({ length: 30 }, (_, index) => (
          <Text key={index} style={{ paddingVertical: 16 }}>
            Trail {index + 1}
          </Text>
        ))}
      </View>
    </DetailsHeaderScrollView>
  );
}
```

## Expanded header height

The predefined Details header uses a compact `parallaxHeight` based on the current
window dimensions, in density-independent pixels (dp):

```ts
const parallaxHeight =
  windowWidth > windowHeight && windowHeight <= 414
    ? 200
    : Math.min(320, Math.max(280, Math.round(windowHeight * 0.32)));
```

This gives short phone landscape windows a 200 dp default and other windows a
280–320 dp default. The value follows window changes, including rotation. Set
`parallaxHeight` explicitly, for example `parallaxHeight={400}`, when longer titles,
subtitles or larger fonts need more room; an explicit value bypasses the default
calculation.

`headerHeight` still defaults to 100 dp. The underlying scroll height remains
`Math.max(parallaxHeight, headerHeight * 2)`, including when an explicit height is
provided.

## Props

### DetailsHeaderScrollView props

Inherits [ScrollViewProps](https://reactnative.dev/docs/scrollview#props) and [Shared DetailsHeader props](#shared-detailsheader-props)

### DetailsHeaderFlatList props

Inherits [FlatListProps](https://reactnative.dev/docs/flatlist#props) and [Shared DetailsHeader props](#shared-detailsheader-props)

### DetailsHeaderSectionList props

Inherits [SectionListProps](https://reactnative.dev/docs/sectionlist#props) and [Shared DetailsHeader props](#shared-detailsheader-props)

### Shared DetailsHeader props

| Prop                           | Type                                                | Default value          |
| ------------------------------ | --------------------------------------------------- | ---------------------- |
| backgroundColor                | color - `ColorValue` or `SharedValue<ColorValue>`   | -                      |
| backgroundImage                | image source - `ImageSourcePropType`                | -                      |
| containerStyle                 | style - `StyleProp<ViewStyle>`                      | -                      |
| contentIcon                    | image source - `ImageSourcePropType`                | -                      |
| contentIconNumber              | number                                              | -                      |
| contentIconNumberStyle         | style - `StyleProp<TextStyle>`                      | -                      |
| contentIconNumberTestID        | string                                              | -                      |
| enableSafeAreaTopInset         | boolean                                             | true                   |
| leftTopIcon                    | render function or image source                     | -                      |
| leftTopIconAccessibilityLabel  | string                                              | -                      |
| leftTopIconOnPress             | function - `() => void`                             | -                      |
| leftTopIconTestID              | string                                              | -                      |
| hasBorderRadius                | boolean                                             | -                      |
| headerHeight                   | number                                              | 100                    |
| image                          | image source - `ImageSourcePropType`                | -                      |
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
| rightTopIcon                   | render function or image source                     | -                      |
| rightTopIconAccessibilityLabel | string                                              | -                      |
| rightTopIconOnPress            | function - `() => void`                             | -                      |
| rightTopIconTestID             | string                                              | -                      |
| snapStartThreshold             | number                                              | -                      |
| snapStopThreshold              | number                                              | -                      |
| snapToEdge                     | boolean                                             | true                   |
| stickyTabs                     | boolean                                             | true                   |
| subtitle                       | string                                              | -                      |
| subtitleStyle                  | style - `StyleProp<TextStyle>`                      | -                      |
| subtitleTestID                 | string                                              | -                      |
| tabsContainerBackgroundColor   | color - `ColorValue` or `SharedValue<ColorValue>`   | -                      |
| tag                            | string                                              | -                      |
| tagStyle                       | style - `StyleProp<TextStyle>`                      | -                      |
| tagTestID                      | string                                              | -                      |
| title                          | string                                              | -                      |
| titleStyle                     | style - `StyleProp<TextStyle>`                      | -                      |
| titleTestID                    | string                                              | -                      |
