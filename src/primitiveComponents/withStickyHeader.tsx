/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { FlatList, Platform, ScrollView, SectionList, StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import type { AnimatedProps } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

import { ElasticHeaderProvider } from './ElasticHeaderContext';
import { hasSupportedRefreshControl } from './NativeScrollHost';
import type { StickyHeaderSharedProps } from './StickyHeaderProps';
import { useInternalStickyHeaderProps } from './useInternalStickyHeaderProps';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const NOOP = () => {};

const createCellRenderer = (itemLayoutAnimation: any) => {
  const cellRenderer: React.FC<
    React.PropsWithChildren<{ onLayout: (event: LayoutChangeEvent) => void }>
  > = (props) => {
    return (
      <Animated.View layout={itemLayoutAnimation} onLayout={props.onLayout}>
        {props.children}
      </Animated.View>
    );
  };

  return cellRenderer;
};

export function withStickyHeader<T extends React.ComponentType<any>>(component: T) {
  const nativeComponent = ([ScrollView, FlatList, SectionList] as readonly unknown[]).includes(
    component
  );
  const AnimatedComponent = Animated.createAnimatedComponent(
    component as React.FunctionComponent<any>
  ) as any;

  return React.forwardRef<React.ComponentRef<T>, StickyHeaderSharedProps & Record<string, any>>(
    (props, ref) => {
      const {
        containerStyle,
        contentContainerStyle,
        enableHeaderBounce = false,
        itemLayoutAnimation,
        overScrollMode = 'never',
        renderHeader,
        renderTabs,
        scrollEventThrottle = 16,
        style,
        ...rest
      } = props;
      const {
        contentContainerPaddingTop,
        contentContainerPaddingBottom,
        elasticity,
        headerAnimatedStyle,
        headerHeight,
        listPaddingTop,
        onHeaderLayoutInternal,
        onTabsLayoutInternal,
        scrollHandler,
        tabsHeight,
      } = useInternalStickyHeaderProps(
        { ...props, enableHeaderBounce },
        nativeComponent &&
          !props.renderScrollComponent &&
          hasSupportedRefreshControl(props.refreshControl)
      );
      const cellRenderer = React.useMemo(
        () => createCellRenderer(itemLayoutAnimation),
        [itemLayoutAnimation]
      );

      const scrollable = (
        <AnimatedComponent
          ref={ref}
          {...rest}
          CellRendererComponent={cellRenderer}
          contentContainerStyle={[
            contentContainerStyle,
            { paddingTop: headerHeight + contentContainerPaddingTop },
            { paddingBottom: tabsHeight + contentContainerPaddingBottom },
          ]}
          onScroll={scrollHandler}
          /**
           * Workaround for reanimated v2.3+ bug
           * https://github.com/software-mansion/react-native-reanimated/issues/2735#issuecomment-1001714779
           */
          onScrollBeginDrag={NOOP}
          onScrollEndDrag={NOOP}
          onMomentumScrollBegin={NOOP}
          onMomentumScrollEnd={NOOP}
          overScrollMode={overScrollMode}
          progressViewOffset={headerHeight}
          scrollEventThrottle={scrollEventThrottle}
          style={[style, { paddingTop: tabsHeight + listPaddingTop }]}
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
            <Animated.View style={[styles.content, elasticity.contentAnimatedStyle]}>
              {elasticity.supported ? (
                <GestureDetector gesture={elasticity.nativeGesture}>{scrollable}</GestureDetector>
              ) : (
                scrollable
              )}
            </Animated.View>
          ) : (
            scrollable
          )}
        </View>
      );

      return (
        <ElasticHeaderProvider value={elasticity.contextValue}>
          {elasticity.supported ? (
            <GestureDetector gesture={elasticity.containerGesture}>{content}</GestureDetector>
          ) : (
            content
          )}
        </ElasticHeaderProvider>
      );
    }
  ) as React.ForwardRefExoticComponent<
    React.PropsWithoutRef<
      StickyHeaderSharedProps &
        Omit<AnimatedProps<React.ComponentPropsWithoutRef<T>>, keyof StickyHeaderSharedProps>
    > &
      React.RefAttributes<React.ComponentRef<T>>
  >;
}

export const styles = StyleSheet.create({
  content: { flex: 1 },
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
