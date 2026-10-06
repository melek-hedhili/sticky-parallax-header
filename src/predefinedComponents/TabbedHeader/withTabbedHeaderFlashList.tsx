import type { FlashList, FlashListRef } from '@shopify/flash-list';
import * as React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { Edge } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';

import { commonStyles } from '../../constants';
import type { FlashListComponent } from '../../primitiveComponents/withStickyHeaderFlashList';
import { withStickyHeaderFlashList } from '../../primitiveComponents/withStickyHeaderFlashList';
import { parseAnimatedColorProp } from '../common/utils/parseAnimatedColorProp';

import type { TabbedHeaderFlashListProps } from './TabbedHeaderFlashListProps';
import { HeaderBar } from './components/HeaderBar';
import { useTabbedFlashListHeader } from './hooks/useTabbedFlashListHeader';

export function withTabbedHeaderFlashList(
  flashListComponent: typeof FlashList
): <ItemT>(
  props: TabbedHeaderFlashListProps<ItemT> & React.RefAttributes<FlashListRef<ItemT>>
) => React.ReactElement | null;
export function withTabbedHeaderFlashList<ItemT>(
  flashListComponent: FlashListComponent<ItemT>
): React.ForwardRefExoticComponent<
  React.PropsWithoutRef<TabbedHeaderFlashListProps<ItemT>> &
    React.RefAttributes<FlashListRef<ItemT>>
>;
export function withTabbedHeaderFlashList<ItemT>(
  flashListComponent: FlashListComponent<ItemT>
): unknown {
  const StickyHeaderFlashList = withStickyHeaderFlashList<ItemT>(flashListComponent);

  return React.forwardRef<FlashListRef<ItemT>, TabbedHeaderFlashListProps<ItemT>>((props, ref) => {
    const {
      backgroundColor,
      decelerationRate = 'fast',
      enableSafeAreaTopInset = true,
      logo,
      logoContainerStyle,
      logoResizeMode,
      logoStyle,
      nestedScrollEnabled = true,
      overScrollMode = 'never',
      renderHeader,
      renderHeaderBar,
      scrollEventThrottle = 16,
      viewabilityConfig = { itemVisiblePercentThreshold: 50 },
      ...rest
    } = props;
    const {
      onMomentumScrollEnd,
      onScroll,
      onScrollEndDrag,
      onViewableItemsChanged,
      renderHeader: defaultRenderHeader,
      renderTabs,
      scrollViewRef,
    } = useTabbedFlashListHeader<ItemT>(props);

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
        ) : logo ? (
          <HeaderBar
            backgroundColor={backgroundColor}
            enableSafeAreaTopInset={enableSafeAreaTopInset}
            logo={logo}
            logoContainerStyle={logoContainerStyle}
            logoResizeMode={logoResizeMode}
            logoStyle={logoStyle}
          />
        ) : (
          <SafeAreaView
            edges={['left', 'right', ...(enableSafeAreaTopInset ? ['top' as Edge] : [])]}
            style={commonStyles.stretch}
          />
        )}
        <View style={commonStyles.wrapper}>
          <StickyHeaderFlashList
            ref={scrollViewRef}
            {...rest}
            decelerationRate={decelerationRate}
            nestedScrollEnabled={nestedScrollEnabled}
            overScrollMode={overScrollMode}
            scrollEventThrottle={scrollEventThrottle}
            viewabilityConfig={viewabilityConfig}
            renderHeader={renderHeader ?? defaultRenderHeader}
            renderTabs={renderTabs}
            onScroll={onScroll}
            onScrollEndDrag={onScrollEndDrag}
            onMomentumScrollEnd={onMomentumScrollEnd}
            onViewableItemsChanged={onViewableItemsChanged}
          />
        </View>
      </Animated.View>
    );
  });
}
