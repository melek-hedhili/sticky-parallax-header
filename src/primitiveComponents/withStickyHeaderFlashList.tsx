/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FlashList, FlashListProps, FlashListRef } from '@shopify/flash-list';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import type { StickyHeaderFlashListProps } from './StickyHeaderFlashListProps';
import { useStickyHeaderProps } from './useStickyHeaderProps';
// eslint-disable-next-line @typescript-eslint/no-empty-function
const NOOP = () => {};

export type FlashListComponent<ItemT> = React.ComponentType<
  FlashListProps<ItemT> & React.RefAttributes<FlashListRef<ItemT>>
>;

export type StickyHeaderFlashListComponent = <ItemT>(
  props: StickyHeaderFlashListProps<ItemT> & React.RefAttributes<FlashListRef<ItemT>>
) => React.ReactElement | null;

// FlashList v2 enables position maintenance by default. Preserve the header's
// existing offset ownership unless the caller explicitly opts into that behavior.
const DEFAULT_MAINTAIN_VISIBLE_CONTENT_POSITION = { disabled: true };

export function withStickyHeaderFlashList(
  flashListComponent: typeof FlashList
): StickyHeaderFlashListComponent;
export function withStickyHeaderFlashList<ItemT>(
  flashListComponent: FlashListComponent<ItemT>
): React.ForwardRefExoticComponent<
  React.PropsWithoutRef<StickyHeaderFlashListProps<ItemT>> &
    React.RefAttributes<FlashListRef<ItemT>>
>;
export function withStickyHeaderFlashList<ItemT>(
  flashListComponent: FlashListComponent<ItemT>
): unknown {
  const AnimatedFlashList = Animated.createAnimatedComponent(flashListComponent) as any;

  return React.forwardRef<FlashListRef<ItemT>, StickyHeaderFlashListProps<ItemT>>((props, ref) => {
    const {
      containerStyle,
      contentContainerStyle,
      overScrollMode = 'never',
      maintainVisibleContentPosition = DEFAULT_MAINTAIN_VISIBLE_CONTENT_POSITION,
      renderHeader,
      renderTabs,
      scrollEventThrottle = 16,
      ...rest
    } = props;
    const {
      contentContainerPaddingTop,
      contentContainerPaddingBottom,
      headerAnimatedStyle,
      headerHeight,
      onHeaderLayoutInternal,
      onTabsLayoutInternal,
      scrollHandler,
      tabsHeight,
    } = useStickyHeaderProps(props);
    const flattenContentContainerStyle = React.useMemo(() => {
      return StyleSheet.flatten([
        contentContainerStyle,
        {
          paddingBottom: tabsHeight + contentContainerPaddingBottom,
          paddingTop: headerHeight + contentContainerPaddingTop,
        },
      ]);
    }, [
      contentContainerPaddingTop,
      contentContainerPaddingBottom,
      contentContainerStyle,
      headerHeight,
      tabsHeight,
    ]);

    return (
      <View style={[styles.container, containerStyle]}>
        <Animated.View pointerEvents="box-none" style={[styles.header, headerAnimatedStyle]}>
          {renderHeader ? (
            <View pointerEvents="box-none" onLayout={onHeaderLayoutInternal}>
              {renderHeader()}
            </View>
          ) : null}
          {renderTabs ? (
            <View pointerEvents="box-none" onLayout={onTabsLayoutInternal}>
              {renderTabs()}
            </View>
          ) : null}
        </Animated.View>
        <View style={[styles.container, { paddingTop: tabsHeight }]}>
          <AnimatedFlashList
            ref={ref}
            {...rest}
            contentContainerStyle={flattenContentContainerStyle}
            maintainVisibleContentPosition={maintainVisibleContentPosition}
            onScroll={scrollHandler}
            onScrollBeginDrag={NOOP}
            onScrollEndDrag={NOOP}
            onMomentumScrollBegin={NOOP}
            onMomentumScrollEnd={NOOP}
            overScrollMode={overScrollMode}
            progressViewOffset={headerHeight}
            scrollEventThrottle={scrollEventThrottle}
          />
        </View>
      </View>
    );
  });
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    flex: 1,
    overflow: 'hidden',
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 999,
  },
});
