import type { FlashListRef } from '@shopify/flash-list';
import * as React from 'react';
import type { ViewStyle } from 'react-native';
import type { AnimatedStyle } from 'react-native-reanimated';
import { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { HeaderWrapper } from '../../common/components/HeaderWrapper';
import { usePredefinedFlashListHeader } from '../../common/hooks/usePredefinedFlashListHeader';
import { scrollPosition } from '../../common/utils/scrollPosition';
import type { DetailsHeaderFlashListProps } from '../DetailsHeaderFlashListProps';
import { Foreground } from '../components/HeaderForeground';

export function useDetailsFlashListHeader<
  ItemT,
  T extends FlashListRef<ItemT> = FlashListRef<ItemT>,
>(props: DetailsHeaderFlashListProps<ItemT>) {
  const {
    contentBackgroundColor,
    onMomentumScrollEnd,
    onScroll,
    onScrollEndDrag,
    parallaxHeight,
    scrollHeight,
    scrollValue,
    scrollViewRef,
  } = usePredefinedFlashListHeader<T>(props);
  const {
    backgroundColor,
    backgroundImage,
    contentIcon,
    contentIconNumber,
    contentIconNumberStyle,
    contentIconNumberTestID,
    hasBorderRadius,
    image,
    subtitle,
    subtitleStyle,
    subtitleTestID,
    tabsContainerBackgroundColor,
    tag,
    tagStyle,
    tagTestID,
    title,
    titleStyle,
    titleTestID,
  } = props;

  const headerTitleInputRange = [
    0,
    scrollPosition(scrollHeight, 60),
    scrollPosition(scrollHeight, 90),
  ];
  const headerTitleContainerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollValue.value,
        headerTitleInputRange,
        [0, 0, 1],
        Extrapolation.CLAMP
      ),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollValue, scrollHeight]);

  const renderHeader = React.useCallback(() => {
    return (
      <HeaderWrapper
        backgroundColor={backgroundColor}
        backgroundImage={backgroundImage}
        contentBackgroundColor={contentBackgroundColor}
        hasBorderRadius={hasBorderRadius}
        parallaxHeight={parallaxHeight}
        scrollHeight={scrollHeight}
        scrollValue={scrollValue}
        tabsContainerBackgroundColor={tabsContainerBackgroundColor}>
        <Foreground
          height={parallaxHeight}
          scrollValue={scrollValue}
          contentIcon={contentIcon}
          contentIconNumber={contentIconNumber}
          contentIconNumberStyle={contentIconNumberStyle}
          contentIconNumberTestID={contentIconNumberTestID}
          image={image}
          subtitle={subtitle}
          subtitleStyle={subtitleStyle}
          subtitleTestID={subtitleTestID}
          tag={tag}
          tagStyle={tagStyle}
          tagTestID={tagTestID}
          title={title}
          titleStyle={titleStyle}
          titleTestID={titleTestID}
        />
      </HeaderWrapper>
    );
  }, [
    backgroundColor,
    backgroundImage,
    contentBackgroundColor,
    contentIcon,
    contentIconNumber,
    contentIconNumberStyle,
    contentIconNumberTestID,
    hasBorderRadius,
    image,
    parallaxHeight,
    scrollHeight,
    scrollValue,
    subtitle,
    subtitleStyle,
    subtitleTestID,
    tabsContainerBackgroundColor,
    tag,
    tagStyle,
    tagTestID,
    title,
    titleStyle,
    titleTestID,
  ]);

  return {
    headerTitleContainerAnimatedStyle:
      headerTitleContainerAnimatedStyle as AnimatedStyle<ViewStyle>,
    onMomentumScrollEnd,
    onScroll,
    onScrollEndDrag,
    renderHeader,
    scrollValue,
    scrollViewRef,
  };
}
