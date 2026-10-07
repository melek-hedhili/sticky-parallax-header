import { Brandon, Ewa, Jennifer } from '@/showcase/assets/data/cards';
import { homeScreenTestIDs } from '@/showcase/screens/home-screen/test-ids';

export const TABS = [
  {
    title: 'Popular',
    contentTitle: 'Popular Quizes',
    testID: homeScreenTestIDs.popularQuizesTab,
    contentTestID: homeScreenTestIDs.popularQuizesHeader,
  },
  {
    title: 'Product Design',
    contentTitle: 'Product Design',
    testID: homeScreenTestIDs.productDesignTab,
    contentTestID: homeScreenTestIDs.productDesignHeader,
  },
  {
    title: 'Development',
    contentTitle: 'Development',
    testID: homeScreenTestIDs.developmentTab,
    contentTestID: homeScreenTestIDs.developmentHeader,
  },
  {
    title: 'Project Management',
    contentTitle: 'Project Management',
    testID: homeScreenTestIDs.projectManagementTab,
    contentTestID: homeScreenTestIDs.projectManagementHeader,
  },
];

export const users = [Brandon, Jennifer, Ewa];
