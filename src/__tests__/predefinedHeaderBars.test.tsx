import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import { HeaderBar as AvatarHeaderBar } from '../predefinedComponents/AvatarHeader/components/HeaderBar';
import { HeaderBar as DetailsHeaderBar } from '../predefinedComponents/DetailsHeader/components/HeaderBar';
import { HeaderBar as TabbedHeaderBar } from '../predefinedComponents/TabbedHeader/components/HeaderBar';

const scrollValue = { value: 0 } as SharedValue<number>;
const image = { uri: 'local-header-image' };
const styles = StyleSheet.create({ hiddenTitle: { opacity: 0 } });

const headerBars = [
  ['Avatar', <AvatarHeaderBar height={300} scrollValue={scrollValue} image={image} />],
  ['Details', <DetailsHeaderBar headerTitleContainerAnimatedStyle={styles.hiddenTitle} />],
  ['Tabbed', <TabbedHeaderBar logo={image} />],
] as const;

test.each(headerBars)(
  '%s header bar measures to its row instead of sharing screen height',
  async (_, headerBar) => {
    await render(headerBar);

    const root = screen.root;

    if (!root) {
      throw new Error('Header bar did not render a safe-area container');
    }

    expect(root).toHaveStyle({ alignSelf: 'stretch', alignItems: 'center' });
    const style = StyleSheet.flatten(root.props.style);

    expect(style.flex ?? 0).toBe(0);
    expect(style.flexGrow ?? 0).toBe(0);
    expect(style.height).toBeUndefined();
  }
);
