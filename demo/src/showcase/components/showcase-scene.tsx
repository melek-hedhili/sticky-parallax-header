import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/showcase/constants';

export function ShowcaseScene({ children }: React.PropsWithChildren) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  return (
    <View style={styles.container}>
      {children}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to demo"
        hitSlop={8}
        onPress={goBack}
        style={[styles.back, { bottom: insets.bottom + 12, left: insets.left + 12 }]}
        testID="showcase-demo-back">
        <Text style={styles.label}>‹ Demo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  back: {
    position: 'absolute',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.black,
  },
  label: { color: colors.white, fontWeight: '600', fontSize: 14 },
});
