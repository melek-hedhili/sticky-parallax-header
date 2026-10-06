import * as React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { commonStyles } from '../../constants';
import type { FlatListRef } from '../../primitiveComponents/ScrollComponent';
import { StickyHeaderFlatList } from '../../primitiveComponents/StickyHeaderFlatList';
import { parseAnimatedColorProp } from '../common/utils/parseAnimatedColorProp';

import type { DetailsHeaderFlatListProps } from './DetailsHeaderProps';
import { HeaderBar } from './components/HeaderBar';
import { useDetailsHeader } from './hooks/useDetailsHeader';

function DetailsHeaderFlatListInner<ItemT>(
  props: DetailsHeaderFlatListProps<ItemT>,
  ref: React.ForwardedRef<FlatListRef<ItemT>>
) {
  const {
    backgroundColor,
    contentContainerStyle,
    data,
    decelerationRate = 'fast',
    enableSafeAreaTopInset = true,
    keyExtractor,
    leftTopIcon,
    leftTopIconAccessibilityLabel,
    leftTopIconOnPress,
    leftTopIconTestID,
    nestedScrollEnabled = true,
    overScrollMode = 'never',
    renderHeader,
    renderHeaderBar,
    renderItem,
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
  } = useDetailsHeader<FlatListRef<ItemT>>(props);

  React.useImperativeHandle(ref, () => scrollViewRef.current as FlatListRef<ItemT>);

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
        <StickyHeaderFlatList
          ref={scrollViewRef}
          {...rest}
          contentContainerStyle={contentContainerStyle}
          data={data}
          decelerationRate={decelerationRate}
          keyExtractor={keyExtractor}
          nestedScrollEnabled={nestedScrollEnabled}
          onScroll={onScroll}
          onMomentumScrollEnd={onMomentumScrollEnd}
          onScrollEndDrag={onScrollEndDrag}
          overScrollMode={overScrollMode}
          renderHeader={renderHeader ?? defaultRenderHeader}
          renderItem={renderItem}
          scrollEventThrottle={scrollEventThrottle}
        />
      </View>
    </Animated.View>
  );
}

type DetailsHeaderFlatListType = <ItemT>(
  props: DetailsHeaderFlatListProps<ItemT> & React.RefAttributes<FlatListRef<ItemT>>
) => React.ReactElement;

export const DetailsHeaderFlatList = React.forwardRef(
  DetailsHeaderFlatListInner
) as DetailsHeaderFlatListType;
