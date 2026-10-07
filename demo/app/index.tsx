import { Link } from 'expo-router';
import type { Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { performanceScenarios } from '@/performance/catalogue';
import { SHOWCASE_CATALOGUE } from '@/showcase/catalogue';
import { validationCases } from '@/validation/catalogue';

const sections = [
  {
    title: 'Showcase',
    description: 'Complete examples with images, quizzes, and custom headers.',
    entries: SHOWCASE_CATALOGUE,
  },
  {
    title: 'Validation',
    description: 'Deterministic cases for scroll refs, refresh, snapping, and navigation.',
    entries: validationCases,
  },
  {
    title: 'Performance',
    description: 'Expo Go workload previews. Release timing requires a controlled native build.',
    entries: performanceScenarios,
  },
];

function CatalogueLink({ label, href, id }: { label: string; href: Href; id: string }) {
  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="link" style={styles.card} testID={`catalogue-${id}`}>
        <Text style={styles.cardText}>{label}</Text>
        <Text accessibilityElementsHidden style={styles.arrow}>
          ›
        </Text>
      </Pressable>
    </Link>
  );
}

export default function Catalogue() {
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>EXPO GO</Text>
        <Text style={styles.title}>Sticky Parallax Header</Text>
        <Text style={styles.subtitle}>
          Explore the library, verify interactions, and inspect realistic workloads.
        </Text>
        {sections.map(({ title, description, entries }) => (
          <View key={title} style={styles.section}>
            <Text style={styles.heading}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
            <View style={styles.cards}>
              {entries.map((entry) => (
                <CatalogueLink key={entry.id} {...entry} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const palette = {
  background: '#f3f7f5',
  accent: '#386155',
  text: '#12392f',
  muted: '#456158',
  surface: '#ffffff',
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  content: { padding: 24, paddingBottom: 48, maxWidth: 900, width: '100%', alignSelf: 'center' },
  eyebrow: { fontSize: 12, letterSpacing: 2, color: palette.accent, marginBottom: 12 },
  title: { fontFamily: 'AvertaStd-Semibold', fontSize: 36, color: palette.text },
  subtitle: {
    fontFamily: 'AvertaStd-Regular',
    fontSize: 17,
    color: palette.muted,
    marginTop: 12,
    lineHeight: 25,
  },
  section: { marginTop: 36 },
  heading: { fontFamily: 'AvertaStd-Semibold', fontSize: 24, color: palette.text },
  description: { color: palette.muted, lineHeight: 22, marginTop: 8, marginBottom: 16 },
  cards: { gap: 8 },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    backgroundColor: palette.surface,
  },
  cardText: { flex: 1, fontFamily: 'AvertaStd-Regular', fontSize: 16, color: palette.text },
  arrow: { fontSize: 24, color: palette.accent, marginLeft: 12 },
});
