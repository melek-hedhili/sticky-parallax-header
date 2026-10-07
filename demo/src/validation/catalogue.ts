import type { Href } from 'expo-router';

const labels = [
  'Primitive ScrollView',
  'Primitive FlatList',
  'Primitive SectionList',
  'Avatar ScrollView',
  'Avatar FlatList',
  'Avatar SectionList',
  'Details ScrollView',
  'Details FlatList',
  'Details SectionList',
  'Tabbed SectionList',
  'Tabbed Pager',
  'Primitive FlashList',
  'Avatar FlashList',
  'Details FlashList',
  'Tabbed FlashList',
] as const;

export const validationCases = labels.map((label) => {
  const id = label.replaceAll(' ', '-').toLowerCase();

  return { id, label, href: `/validation/${id}` as Href };
});

export type ValidationCaseName = (typeof labels)[number];
