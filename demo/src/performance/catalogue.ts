import type { Href } from 'expo-router';

const labels = [
  'Primitive',
  'Primitive FlashList',
  'Avatar',
  'Avatar FlashList',
  'Details',
  'Details FlashList',
  'Tabbed SectionList',
  'Tabbed FlashList',
  'Pager',
] as const;

export const performanceScenarios = labels.map((label) => {
  const id = label.replaceAll(' ', '-').toLowerCase();

  return { id, label, href: `/performance/${id}` as Href };
});

export type PerformanceScenarioName = (typeof labels)[number];
