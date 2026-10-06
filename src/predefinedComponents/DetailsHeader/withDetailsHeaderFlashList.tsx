import type { FlashList, FlashListRef } from '@shopify/flash-list';
import * as React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { commonStyles } from '../../constants';
import type { FlashListComponent } from '../../primitiveComponents/withStickyHeaderFlashList';
import { withStickyHeaderFlashList } from '../../primitiveComponents/withStickyHeaderFlashList';
import { parseAnimatedColorProp } from '../common/utils/parseAnimatedColorProp';

import type { DetailsHeaderFlashListProps } from './DetailsHeaderFlashListProps';
import { HeaderBar } from './components/HeaderBar';
import { useDetailsFlashListHeader } from './hooks/useDetailsFlashListHeader';

export function withDetailsHeaderFlashList(
  flashListComponent: typeof FlashList
): <ItemT>(
  props: DetailsHeaderFlashListProps<ItemT> & React.RefAttributes<FlashListRef<ItemT>>
) => React.ReactElement | null;
export function withDetailsHeaderFlashList<ItemT>(
  flashListComponent: FlashListComponent<ItemT>
): React.ForwardRefExoticComponent<
  React.PropsWithoutRef<DetailsHeaderFlashListProps<ItemT>> &
    React.RefAttributes<FlashListRef<ItemT>>
>;
export function withDetailsHeaderFlashList<ItemT>(
  flashListComponent: FlashListComponent<ItemT>
): unknown {
  const StickyHeaderFlashList = withStickyHeaderFlashList<ItemT>(flashListComponent);

  return React.forwardRef<FlashListRef<ItemT>, DetailsHeaderFlashListProps<ItemT>>((props, ref) => {
    const {
      backgroundColor,
      decelerationRate = 'fast',
      enableSafeAreaTopInset = true,
      leftTopIcon,
      leftTopIconAccessibilityLabel,
      leftTopIconOnPress,
      leftTopIconTestID,
      nestedScrollEnabled = true,
      overScrollMode = 'never',
      renderHeader,
      renderHeaderBar,
      rightTopIcon,
      rightTopIconAccessibilityLabel,
      rightTopIconOnPress,
      rightTopIconTestID,
      scrollEventThrottle = 16,
      title,
      titleStyle,
      ...rest
    } = props;
    const {
      headerTitleContainerAnimatedStyle,
      renderHeader: defaultRenderHeader,
      scrollViewRef,
      onScroll,
      onScrollEndDrag,
      onMomentumScrollEnd,
    } = useDetailsFlashListHeader<ItemT>(props);

    React.useImperativeHandle(ref, () => scrollViewRef.current as FlashListRef<ItemT>);

    const wrapperAnimatedStyle = useAnimatedStyle(() => {
      return {
        backgroundColor: parseAnimatedColorProp(backgroundColor),
      };
    }, [backgroundColor]);

    return (
      <Animated.View style={[commonStyles.container, wrapperAnimatedStyle]}>
        {renderHeaderBar ? (
          renderHeaderBar()
        ) : (
          <HeaderBar
            backgroundColor={backgroundColor}
            enableSafeAreaTopInset={enableSafeAreaTopInset}
            headerTitleContainerAnimatedStyle={headerTitleContainerAnimatedStyle}
            leftTopIcon={leftTopIcon}
            leftTopIconAccessibilityLabel={leftTopIconAccessibilityLabel}
            leftTopIconOnPress={leftTopIconOnPress}
            leftTopIconTestID={leftTopIconTestID}
            rightTopIcon={rightTopIcon}
            rightTopIconAccessibilityLabel={rightTopIconAccessibilityLabel}
            rightTopIconOnPress={rightTopIconOnPress}
            rightTopIconTestID={rightTopIconTestID}
            title={title}
            titleStyle={titleStyle}
          />
        )}
        <View style={commonStyles.container}>
          <StickyHeaderFlashList
            ref={scrollViewRef}
            {...rest}
            decelerationRate={decelerationRate}
            nestedScrollEnabled={nestedScrollEnabled}
            onScroll={onScroll}
            onMomentumScrollEnd={onMomentumScrollEnd}
            onScrollEndDrag={onScrollEndDrag}
            overScrollMode={overScrollMode}
            renderHeader={renderHeader ?? defaultRenderHeader}
            scrollEventThrottle={scrollEventThrottle}
          />
        </View>
      </Animated.View>
    );
  });
}
