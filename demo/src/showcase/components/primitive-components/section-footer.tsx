import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/showcase/constants';

export const SectionFooter: React.FC = () => {
  return (
    <View style={styles.sectionFooterContainer}>
      <Text style={styles.sectionFooterLabel}>Section footer</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionFooterContainer: {
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  sectionFooterLabel: {
    color: colors.greyishBrown,
    fontFamily: 'AvertaStd-Regular',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'left',
  },
});
