import * as React from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';

import { colors, screenStyles } from '../../constants';

export const Paragraph: React.FC<{ text: string }> = ({ text }) => {
  return (
    <Pressable
      android_ripple={{
        borderless: false,
        color: colors.paleGrey,
      }}
      style={({ pressed }) => [styles.paragraphContainer, pressed && styles.pressedTab]}>
      <Text style={[screenStyles.text, styles.paragraph]}>{text}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  paragraph: {
    color: colors.greyishBrown,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
  },
  paragraphContainer: {
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderColor: colors.paleGrey,
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 24,
    marginVertical: 8,
    padding: 16,
  },
  pressedTab: {
    opacity: Platform.select({
      android: 1,
      default: 0.4,
    }),
  },
});
