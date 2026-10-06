---
sidebar_position: 4
---

# Avatar Header

![Avatar Header Gif](@site/static/img/assets/readme_Avatar.gif)

## Example usage

These examples assume a `SafeAreaProvider` at the app root, as shown in the [installation guide](../introduction/installation.md).

Check out AvatarHeader examples for [ScrollView](https://github.com/netguru/sticky-parallax-header/blob/master/example/src/screens/additionalExamples/AvatarHeaderScrollViewExample.tsx), [FlatList](https://github.com/netguru/sticky-parallax-header/blob/master/example/src/screens/additionalExamples/AvatarHeaderFlatListExample.tsx), [SectionList](https://github.com/netguru/sticky-parallax-header/blob/master/example/src/screens/additionalExamples/AvatarHeaderSectionListExample.tsx) & [FlashList](https://github.com/netguru/sticky-parallax-header/blob/master/example/src/screens/additionalExamples/AvatarHeaderFlashListExample.tsx)

```tsx
import { Text, View } from 'react-native';
import { AvatarHeaderScrollView } from 'react-native-sticky-parallax-header';

export default function ProfileScreen() {
  return (
    <AvatarHeaderScrollView
      containerStyle={{ flex: 1 }}
      backgroundColor="#22577a"
      title="Alex Morgan"
      subtitle="A collection of field notes"
      titleStyle={{ color: 'white' }}
      hasBorderRadius>
      <View style={{ padding: 24 }}>
        {Array.from({ length: 30 }, (_, index) => (
          <Text key={index} style={{ paddingVertical: 16 }}>
            Note {index + 1}
          </Text>
        ))}
      </View>
    </AvatarHeaderScrollView>
  );
}
```

## Expanded header height

The predefined Avatar header uses a compact `parallaxHeight` based on the current
window dimensions, in density-independent pixels (dp):

```ts
const parallaxHeight =
  windowWidth > windowHeight && windowHeight <= 414
    ? 200
    : Math.min(320, Math.max(280, Math.round(windowHeight * 0.32)));
```

This gives short phone landscape windows a 200 dp default and other windows a
280–320 dp default. The value follows window changes, including rotation. Set
`parallaxHeight` explicitly, for example `parallaxHeight={400}`, when a longer
biography or larger fonts need more room; an explicit value bypasses the default
calculation.

`headerHeight` still defaults to 100 dp. The underlying scroll height remains
`Math.max(parallaxHeight, headerHeight * 2)`, including when an explicit height is
provided.

## Props

### AvatarHeaderScrollView props

Inherits [ScrollViewProps](https://reactnative.dev/docs/scrollview#props) and [Shared AvatarHeader props](#shared-avatarheader-props)

### AvatarHeaderFlatList props

Inherits [FlatListProps](https://reactnative.dev/docs/flatlist#props) and [Shared AvatarHeader props](#shared-avatarheader-props)

### AvatarHeaderSectionList props

Inherits [SectionListProps](https://reactnative.dev/docs/sectionlist#props) and [Shared AvatarHeader props](#shared-avatarheader-props)

### Shared AvatarHeader props

| Prop                           | Type                                                | Default value          |
| ------------------------------ | --------------------------------------------------- | ---------------------- |
| backgroundColor                | color - `ColorValue` or `SharedValue<ColorValue>`   | -                      |
| backgroundImage                | image source - `ImageSourcePropType`                | -                      |
| containerStyle                 | style - `StyleProp<ViewStyle>`                      | -                      |
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
| title                          | string                                              | -                      |
| titleStyle                     | style - `StyleProp<TextStyle>`                      | -                      |
| titleTestID                    | string                                              | -                      |
