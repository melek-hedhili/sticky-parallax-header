import { Link } from 'expo-router';
import type { Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function RouteError({ message, href = '/' }: { message: string; href?: Href }) {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        <Text style={styles.title}>Screen unavailable</Text>
        <Text>{message}</Text>
        <Link href={href} replace asChild>
          <Pressable accessibilityRole="button" style={styles.link}>
            <Text>Return to catalogue</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 24, gap: 16 },
  title: { fontSize: 24, fontWeight: '600' },
  link: { paddingVertical: 16 },
});
