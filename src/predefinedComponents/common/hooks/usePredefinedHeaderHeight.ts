import { useWindowDimensions } from 'react-native';

import { constants } from '../../../constants';

export function usePredefinedHeaderHeight(parallaxHeight?: number) {
  const { height, width } = useWindowDimensions();
  const isShortLandscape = width > height && height <= constants.breakpoints.mediumPhoneShorterEdge;
  const defaultHeight = isShortLandscape
    ? 200
    : Math.min(320, Math.max(280, Math.round(height * 0.32)));

  return { height, parallaxHeight: parallaxHeight ?? defaultHeight };
}
