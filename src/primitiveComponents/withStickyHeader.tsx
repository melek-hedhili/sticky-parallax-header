/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { StyleSheet, View } from 'react-native';
import type { AnimatedProps } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

import type { StickyHeaderSharedProps } from './StickyHeaderProps';
import { useStickyHeaderProps } from './useStickyHeaderProps';

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
  const AnimatedComponent = Animated.createAnimatedComponent(
    component as React.FunctionComponent<any>
  ) as any;

  return React.forwardRef<React.ComponentRef<T>, StickyHeaderSharedProps & Record<string, any>>(
    (props, ref) => {
      const {
        containerStyle,
        contentContainerStyle,
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
        headerAnimatedStyle,
        headerHeight,
        listPaddingTop,
        onHeaderLayoutInternal,
        onTabsLayoutInternal,
        scrollHandler,
        tabsHeight,
      } = useStickyHeaderProps(props);

      const cellRenderer = React.useMemo(
        () => createCellRenderer(itemLayoutAnimation),
        [itemLayoutAnimation]
      );

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
             *
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
        </View>
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
