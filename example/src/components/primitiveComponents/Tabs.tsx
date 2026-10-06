import * as React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants';

export const Tabs: React.FC = () => {
  return (
    <View style={styles.tabsContainer}>
      <Tab title="Tab 1" />
      <Tab title="Tab 2" />
      <Tab title="Tab 3" />
      <Tab title="Tab 4" />
      <Tab title="Tab 5" />
    </View>
  );
};

const Tab: React.FC<{ title: string }> = ({ title }) => {
  return (
    <Pressable
      android_ripple={{
        borderless: false,
        color: colors.paleGrey,
      }}
      style={({ pressed }) => [styles.tab, pressed && styles.pressedTab]}>
      <Text style={styles.tabTitle}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressedTab: {
    opacity: Platform.select({
      android: 1,
      default: 0.4,
    }),
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 4,
    paddingVertical: 12,
  },
  tabTitle: {
    color: colors.white,
    fontFamily: 'AvertaStd-Semibold',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  tabsContainer: {
    alignItems: 'center',
    backgroundColor: colors.secondaryGreen,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 12,
  },
});
