import { beforeEach, expect, jest, test } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { useEffect } from 'react';
import { Text } from 'react-native';

import { FocusedScene } from '@/components/focused-scene';

let mockFocused = true;

jest.mock('expo-router/react-navigation', () => ({ useIsFocused: () => mockFocused }), {
  virtual: true,
});

beforeEach(() => {
  mockFocused = true;
});

test('a retained inactive route releases its workload and mounts it afresh on return', async () => {
  const mount = jest.fn();
  const release = jest.fn();

  function Workload() {
    useEffect(() => {
      mount();

      return () => {
        release();
      };
    }, []);

    return <Text>Active workload</Text>;
  }

  const scene = () => (
    <FocusedScene>
      <Workload />
    </FocusedScene>
  );

  await render(scene());
  expect(screen.getByText('Active workload')).toBeOnTheScreen();
  expect(mount).toHaveBeenCalledTimes(1);
  mockFocused = false;
  await screen.rerender(scene());
  expect(screen.queryByText('Active workload')).not.toBeOnTheScreen();
  expect(release).toHaveBeenCalledTimes(1);
  mockFocused = true;
  await screen.rerender(scene());
  expect(mount).toHaveBeenCalledTimes(2);
  await screen.unmount();
  expect(release).toHaveBeenCalledTimes(2);
});

test('an initially inactive route never starts its workload', async () => {
  const mount = jest.fn();

  function Workload() {
    useEffect(() => {
      mount();
    }, []);

    return <Text>Inactive workload</Text>;
  }

  mockFocused = false;
  await render(
    <FocusedScene>
      <Workload />
    </FocusedScene>
  );
  expect(screen.queryByText('Inactive workload')).not.toBeOnTheScreen();
  expect(mount).not.toHaveBeenCalled();
});
