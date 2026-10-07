import * as React from 'react';
import type { LayoutChangeEvent, ListRenderItemInfo } from 'react-native';
import { Dimensions, FlatList, I18nManager, Platform, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';

import { commonStyles } from '../../../constants';
import type { FlatListRef } from '../../../primitiveComponents/ScrollComponent';
import { debounce } from '../../common/utils/debounce';
import type { InternalPagerProps } from '../InternalTabbedHeaderProps';
import type { PagerMethods, PagerProps } from '../TabbedHeaderProps';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const NOOP = () => {};

const SCROLL_TO_PAGE_OFFSET_TIMEOUT = 250;

type Page = React.ReactNode;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Page>);

export const Pager = React.forwardRef<PagerMethods, PagerProps & InternalPagerProps>(
  (
    {
      automaticallyAdjustContentInsets = false,
      children,
      contentContainerStyle,
      contentOffset: _contentOffset,
      directionalLockEnabled = true,
      disableScrollToPosition,
      initialPage = 0,
      keyboardDismissMode = 'on-drag',
      minScrollHeight,
      onChangeTab,
      onMomentumScrollBegin,
      onMomentumScrollEnd,
      onScroll,
      onScrollBeginDrag,
      onScrollEndDrag,
      page = -1,
      pageContainerStyle,
      rememberTabScrollPosition,
      scrollEventThrottle = 16,
      scrollHeight,
      scrollRef,
      scrollValue,
      scrollsToTop = false,
      showsHorizontalScrollIndicator = false,
      swipedPage,
      ...rest
    },
    ref
  ) => {
    const [containerWidth, setContainerWidth] = React.useState(
      () => Dimensions.get('window').width
    );
    const containerWidthRef = React.useRef(containerWidth);
    const currentPageRef = React.useRef(initialPage);
    const horizontalFlatListRef = useAnimatedRef<FlatListRef<Page>>();

    const scrollToTabPositionTimeoutValue = useSharedValue(1);

    const data = React.useMemo(() => {
      return React.Children.toArray(children);
    }, [children]);

    const tabsScrollPosition = React.useRef<number[]>(Array(data.length).fill(-1));

    const goToPageAnimationFrame = React.useRef<
      ReturnType<typeof requestAnimationFrame> | undefined
    >(undefined);

    const isInvertedAndroid = Platform.OS === 'android' ? I18nManager.isRTL : undefined;

    const scrollToPage = React.useCallback(
      (offset: number) => {
        'worklet';
        if (Platform.OS === 'web') {
          horizontalFlatListRef.current?.scrollToOffset({ offset, animated: true });

          return;
        }

        scrollTo(horizontalFlatListRef, offset, 0, true);
      },
      [horizontalFlatListRef]
    );

    const scrollToTabPosition = React.useCallback(
      (position: number) => {
        'worklet';
        if (Platform.OS === 'web') {
          scrollRef.current?.scrollTo({ x: 0, y: position, animated: true });

          return;
        }

        scrollTo(scrollRef, 0, position, true);
      },
      [scrollRef]
    );

    const handleScrollToTabPosition = React.useCallback(
      (prevPage: number, newPage: number) => {
        if (!data.length || scrollValue.value === 0 || disableScrollToPosition) {
          return;
        }

        tabsScrollPosition.current[prevPage] = scrollValue.value;
        const savedPosition = tabsScrollPosition.current[newPage];
        const scrollTargetPosition =
          rememberTabScrollPosition && savedPosition !== undefined && savedPosition !== -1
            ? savedPosition
            : scrollHeight;

        scrollToTabPositionTimeoutValue.value = withDelay(
          SCROLL_TO_PAGE_OFFSET_TIMEOUT,
          withTiming(scrollToTabPositionTimeoutValue.value * -1, { duration: 0 }, (finished) => {
            'worklet';
            if (finished) {
              scrollToTabPosition(scrollTargetPosition);
            }
          })
        );
      },
      [
        data.length,
        disableScrollToPosition,
        rememberTabScrollPosition,
        scrollHeight,
        scrollToTabPosition,
        scrollToTabPositionTimeoutValue,
        scrollValue,
      ]
    );

    const goToPage = React.useCallback(
      (pageNumber: number) => {
        if (!Number.isInteger(pageNumber) || pageNumber < 0 || pageNumber >= data.length) {
          return;
        }

        const previousPage = currentPageRef.current;
        const offset = pageNumber * containerWidthRef.current;

        handleScrollToTabPosition(previousPage, pageNumber);
        scheduleOnUI(scrollToPage, offset);
        currentPageRef.current = pageNumber;
        onChangeTab?.(previousPage, pageNumber);
      },
      [data.length, handleScrollToTabPosition, onChangeTab, scrollToPage]
    );

    React.useEffect(() => {
      if (page !== currentPageRef.current && page >= 0) {
        goToPage(page);
      }
    }, [goToPage, page]);

    React.useEffect(() => {
      // Retain the initial visibility workaround at the requested page offset.
      const offset = currentPageRef.current * containerWidthRef.current;

      horizontalFlatListRef.current?.scrollToOffset({ offset: offset + 1, animated: true });
      horizontalFlatListRef.current?.scrollToOffset({ offset, animated: true });

      return () => {
        cancelAnimation(scrollToTabPositionTimeoutValue);
        if (goToPageAnimationFrame.current !== undefined) {
          cancelAnimationFrame(goToPageAnimationFrame.current);
        }
      };
    }, [horizontalFlatListRef, scrollToTabPositionTimeoutValue]);

    function onContainerLayout(e: LayoutChangeEvent) {
      const { width } = e.nativeEvent.layout;

      if (!width || width <= 0 || Math.round(width) === Math.round(containerWidth)) {
        return;
      }

      setContainerWidth(width);
      containerWidthRef.current = width;
      if (goToPageAnimationFrame.current !== undefined) {
        cancelAnimationFrame(goToPageAnimationFrame.current);
      }

      goToPageAnimationFrame.current = requestAnimationFrame(() => {
        goToPage(currentPageRef.current);
      });
    }

    const handlePossiblePageChange = React.useCallback(
      (offsetX: number) => {
        const newPage = Math.round(offsetX / containerWidthRef.current);
        const previousPage = currentPageRef.current;

        if (previousPage !== newPage && newPage >= 0 && newPage < data.length) {
          currentPageRef.current = newPage;
          swipedPage?.(newPage);
          onChangeTab?.(previousPage, newPage);
          handleScrollToTabPosition(previousPage, newPage);
        }
      },
      [data.length, handleScrollToTabPosition, onChangeTab, swipedPage]
    );

    const handlePossiblePageChangeOnWeb = React.useMemo(
      () => debounce(handlePossiblePageChange, 100),
      [handlePossiblePageChange]
    );

    React.useEffect(
      () => () => handlePossiblePageChangeOnWeb.cancel(),
      [handlePossiblePageChangeOnWeb]
    );

    const scrollHandler = useAnimatedScrollHandler({
      onScroll: (e) => {
        onScroll?.(e);
        if (Platform.OS === 'web') {
          // On web there is no onMomentumScrollEnd
          const offsetX = e.contentOffset.x;

          scheduleOnRN(handlePossiblePageChangeOnWeb, offsetX);
        }
      },
      onBeginDrag: (e) => {
        onScrollBeginDrag?.(e);
      },
      onEndDrag: (e) => {
        onScrollEndDrag?.(e);
      },
      onMomentumBegin: (e) => {
        onMomentumScrollBegin?.(e);
      },
      onMomentumEnd: (e) => {
        onMomentumScrollEnd?.(e);
        const offsetX = e.contentOffset.x;

        scheduleOnRN(handlePossiblePageChange, offsetX);
      },
    });

    React.useImperativeHandle(ref, () => ({ goToPage }), [goToPage]);

    const renderItem = React.useCallback(
      ({ item }: ListRenderItemInfo<Page>) => {
        return (
          <Animated.View
            style={[
              isInvertedAndroid && styles.inversionStyle,
              // used to calculate current height of scroll
              {
                width: containerWidth,
              },
              pageContainerStyle,
            ]}>
            {item}
          </Animated.View>
        );
      },
      [containerWidth, isInvertedAndroid, pageContainerStyle]
    );

    return (
      <View style={styles.container} onLayout={onContainerLayout}>
        <AnimatedFlatList
          ref={horizontalFlatListRef}
          {...rest}
          automaticallyAdjustContentInsets={automaticallyAdjustContentInsets}
          contentContainerStyle={[
            Platform.OS === 'android'
              ? I18nManager.isRTL
                ? commonStyles.rowReverse
                : commonStyles.row
              : null,
            { minHeight: minScrollHeight },
            contentContainerStyle,
          ]}
          contentOffset={{ x: initialPage * containerWidth, y: 0 }}
          data={data}
          directionalLockEnabled={directionalLockEnabled}
          horizontal
          keyExtractor={(_, i) => `${i}`}
          keyboardDismissMode={keyboardDismissMode}
          onScroll={scrollHandler}
          /**
           * Workaround for reanimated v2.3+ bug
           *
           * https://github.com/software-mansion/react-native-reanimated/issues/2735#issuecomment-1001714779
           */
          onMomentumScrollBegin={NOOP}
          onMomentumScrollEnd={NOOP}
          onScrollBeginDrag={NOOP}
          onScrollEndDrag={NOOP}
          pagingEnabled
          renderItem={renderItem}
          scrollEventThrottle={scrollEventThrottle}
          scrollsToTop={scrollsToTop}
          showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
          style={[isInvertedAndroid && styles.inversionStyle]}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inversionStyle: {
    transform: [{ scaleX: -1 }],
  },
});
