import * as React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { commonStyles } from '../../constants';
import type { ScrollViewRef } from '../../primitiveComponents/ScrollComponent';
import { StickyHeaderScrollView } from '../../primitiveComponents/StickyHeaderScrollView';
import { parseAnimatedColorProp } from '../common/utils/parseAnimatedColorProp';

import type { AvatarHeaderScrollViewProps } from './AvatarHeaderProps';
import { HeaderBar } from './components/HeaderBar';
import { useAvatarHeader } from './hooks/useAvatarHeader';

export const AvatarHeaderScrollView: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<AvatarHeaderScrollViewProps> & React.RefAttributes<ScrollViewRef>
> = React.forwardRef<ScrollViewRef, AvatarHeaderScrollViewProps>((props, ref) => {
  const {
    backgroundColor,
    children,
    contentContainerStyle,
    decelerationRate = 'fast',
    enableSafeAreaTopInset = true,
    image,
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
    onMomentumScrollEnd,
    onScroll,
    onScrollEndDrag,
    parallaxHeight,
    renderHeader: defaultRenderHeader,
    scrollValue,
    scrollViewRef,
  } = useAvatarHeader<ScrollViewRef>(props);

  React.useImperativeHandle(ref, () => scrollViewRef.current as ScrollViewRef);

  const wrapperAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: parseAnimatedColorProp(backgroundColor),
    };
  }, [backgroundColor]);

  return (
    <Animated.View style={[commonStyles.wrapper, wrapperAnimatedStyle]}>
      {renderHeaderBar ? (
        renderHeaderBar()
      ) : (
        <HeaderBar
          backgroundColor={backgroundColor}
          enableSafeAreaTopInset={enableSafeAreaTopInset}
          height={parallaxHeight}
          image={image}
          leftTopIcon={leftTopIcon}
          leftTopIconAccessibilityLabel={leftTopIconAccessibilityLabel}
          leftTopIconOnPress={leftTopIconOnPress}
          leftTopIconTestID={leftTopIconTestID}
          rightTopIcon={rightTopIcon}
          rightTopIconAccessibilityLabel={rightTopIconAccessibilityLabel}
          rightTopIconOnPress={rightTopIconOnPress}
          rightTopIconTestID={rightTopIconTestID}
          scrollValue={scrollValue}
          title={title}
          titleStyle={titleStyle}
        />
      )}
      <View style={commonStyles.wrapper}>
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
          scrollEventThrottle={scrollEventThrottle}>
          {children}
        </StickyHeaderScrollView>
      </View>
    </Animated.View>
  );
});
