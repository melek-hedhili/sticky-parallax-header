/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FlashList, FlashListProps, FlashListRef } from '@shopify/flash-list';
import * as React from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import { ElasticHeaderProvider } from './ElasticHeaderContext';
import {
  HeaderScrollView,
  NativeScrollProvider,
  hasSupportedRefreshControl,
} from './NativeScrollHost';
import type { StickyHeaderFlashListProps } from './StickyHeaderFlashListProps';
import { useInternalStickyHeaderProps } from './useInternalStickyHeaderProps';
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
      enableHeaderBounce = false,
      overScrollMode = 'never',
      maintainVisibleContentPosition = DEFAULT_MAINTAIN_VISIBLE_CONTENT_POSITION,
      renderHeader,
      renderScrollComponent,
      renderTabs,
      scrollEventThrottle = 16,
      ...rest
    } = props;
    const {
      contentContainerPaddingTop,
      contentContainerPaddingBottom,
      elasticity,
      headerAnimatedStyle,
      headerHeight,
      onHeaderLayoutInternal,
      onTabsLayoutInternal,
      scrollHandler,
      tabsHeight,
    } = useInternalStickyHeaderProps(
      { ...props, enableHeaderBounce },
      (renderScrollComponent === undefined ||
        ([ScrollView, Animated.ScrollView] as readonly unknown[]).includes(
          renderScrollComponent
        )) &&
        hasSupportedRefreshControl(props.refreshControl)
    );
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

    const scrollable = (
      <AnimatedFlashList
        ref={ref}
        {...rest}
        renderScrollComponent={elasticity.supported ? HeaderScrollView : renderScrollComponent}
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
    );

    const content = (
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
        {Platform.OS === 'android' ? (
          <Animated.View
            style={[styles.container, { paddingTop: tabsHeight }, elasticity.contentAnimatedStyle]}>
            {scrollable}
          </Animated.View>
        ) : (
          <View style={[styles.container, { paddingTop: tabsHeight }]}>{scrollable}</View>
        )}
      </View>
    );

    return (
      <ElasticHeaderProvider value={elasticity.contextValue}>
        <NativeScrollProvider value={elasticity.supported ? elasticity.nativeGesture : null}>
          {elasticity.supported ? (
            <GestureDetector gesture={elasticity.containerGesture}>{content}</GestureDetector>
          ) : (
            content
          )}
        </NativeScrollProvider>
      </ElasticHeaderProvider>
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
