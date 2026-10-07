import { useFonts } from 'expo-font';
import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, I18nManager, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'AvertaStd-Regular': require('../src/showcase/assets/fonts/averta-std-regular.otf'),
    'AvertaStd-Semibold': require('../src/showcase/assets/fonts/averta-std-semibold.otf'),
  });

  useEffect(() => {
    I18nManager.allowRTL(true);
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        {error ? (
          <View style={styles.loading}>
            <Text>Could not load the demo fonts. Reload the app to try again.</Text>
            <Text>{error.message}</Text>
          </View>
        ) : loaded ? (
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen
              name="showcase/author/[user-id]"
              options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="showcase/tabbed-header/section-lists"
              options={{ headerShown: true, title: 'SectionList Tabs' }}
            />
          </Stack>
        ) : (
          <View style={styles.loading}>
            <ActivityIndicator accessibilityLabel="Loading demo fonts" />
            <Text>Loading demo…</Text>
          </View>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
});
