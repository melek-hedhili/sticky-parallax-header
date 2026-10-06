import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants';

export const SectionHeader: React.FC = () => {
  return (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeaderLabel}>Section header</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeaderContainer: {
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    backgroundColor: colors.paleGrey,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sectionHeaderLabel: {
    color: colors.greyishBrown,
    fontFamily: 'AvertaStd-Semibold',
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'left',
  },
});
