import * as React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { logo } from '@/showcase/assets/images';
import { colors, screenStyles } from '@/showcase/constants';

export const Header: React.FC = () => {
  return (
    <View style={styles.headerContainer}>
      <Image
        accessibilityLabel="Netguru"
        resizeMode="contain"
        source={logo}
        style={styles.headerImage}
      />
      <Text style={styles.title}>Explore sticky headers</Text>
      <Text style={[screenStyles.text, styles.description]}>Scroll to collapse the header.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: colors.primaryGreen,
    justifyContent: 'center',
    minHeight: 200,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  headerImage: {
    height: 24,
    width: 142,
  },
  title: {
    color: colors.white,
    fontFamily: 'AvertaStd-Semibold',
    fontSize: 24,
    lineHeight: 28,
    marginTop: 16,
    textAlign: 'center',
  },
  description: {
    color: colors.white,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
    textAlign: 'center',
  },
});
