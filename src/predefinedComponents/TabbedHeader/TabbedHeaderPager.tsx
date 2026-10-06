import * as React from 'react';
import type { NativeScrollEvent } from 'react-native';
import { View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { Edge } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';

import { commonStyles } from '../../constants';
import type { ScrollViewRef } from '../../primitiveComponents/ScrollComponent';
import { StickyHeaderScrollView } from '../../primitiveComponents/StickyHeaderScrollView';
import { parseAnimatedColorProp } from '../common/utils/parseAnimatedColorProp';

import type { TabbedHeaderPagerProps } from './TabbedHeaderProps';
import { HeaderBar } from './components/HeaderBar';
import { Pager } from './components/Pager';
import { useTabbedHeaderPager } from './hooks/useTabbedHeader';

export const TabbedHeaderPager: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<TabbedHeaderPagerProps> & React.RefAttributes<ScrollViewRef>
> = React.forwardRef<ScrollViewRef, TabbedHeaderPagerProps>((props, ref) => {
  const {
    backgroundColor,
    children,
    contentContainerStyle,
    disableScrollToPosition,
    decelerationRate = 'fast',
    enableSafeAreaTopInset = true,
    initialPage,
    logo,
    logoContainerStyle,
    logoResizeMode,
    logoStyle,
    nestedScrollEnabled = true,
    onChangeTab,
    overScrollMode = 'never',
    pagerProps,
    pageContainerStyle,
    rememberTabScrollPosition,
    renderHeader,
    renderHeaderBar,
    scrollEventThrottle = 16,
    ...rest
  } = props;
  const {
    currentPage,
    innerScrollHeight,
    onHorizontalPagerScroll,
    onMomentumScrollEnd,
    onScroll,
    onScrollEndDrag,
    renderHeader: defaultRenderHeader,
    renderTabs,
    scrollHeight,
    scrollValue,
    scrollViewRef,
    setCurrentPage,
  } = useTabbedHeaderPager(props);

  React.useImperativeHandle(ref, () => scrollViewRef.current as ScrollViewRef);

  const wrapperAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: parseAnimatedColorProp(backgroundColor),
    };
  }, [backgroundColor]);

  const handleChangeTab = React.useCallback(
    (prevPage: number, newPage: number) => {
      setCurrentPage(newPage);
      onChangeTab?.(prevPage, newPage);
    },
    [onChangeTab, setCurrentPage]
  );

  const onPagerScroll = pagerProps?.onScroll;
  const handleScroll = React.useCallback(
    (e: NativeScrollEvent) => {
      'worklet';
      onHorizontalPagerScroll(e);
      onPagerScroll?.(e);
    },
    [onHorizontalPagerScroll, onPagerScroll]
  );

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
      <View style={commonStyles.container}>
        <StickyHeaderScrollView
          ref={scrollViewRef}
          {...rest}
          contentContainerStyle={contentContainerStyle}
          decelerationRate={decelerationRate}
          nestedScrollEnabled={nestedScrollEnabled}
          onMomentumScrollEnd={onMomentumScrollEnd}
          onScrollEndDrag={onScrollEndDrag}
          onScroll={onScroll}
          overScrollMode={overScrollMode}
          renderHeader={renderHeader ?? defaultRenderHeader}
          renderTabs={renderTabs}
          scrollEventThrottle={scrollEventThrottle}>
          <Pager
            {...pagerProps}
            disableScrollToPosition={disableScrollToPosition}
            initialPage={initialPage}
            minScrollHeight={innerScrollHeight}
            onChangeTab={handleChangeTab}
            onScroll={handleScroll}
            page={currentPage}
            pageContainerStyle={pageContainerStyle}
            rememberTabScrollPosition={rememberTabScrollPosition}
            scrollHeight={scrollHeight}
            scrollRef={scrollViewRef}
            scrollValue={scrollValue}>
            {children}
          </Pager>
        </StickyHeaderScrollView>
      </View>
    </Animated.View>
  );
});
