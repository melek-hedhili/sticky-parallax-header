import * as React from 'react';
import type { SharedValue } from 'react-native-reanimated';
import { useSharedValue } from 'react-native-reanimated';

export interface HeaderElasticity {
  displacement: Readonly<SharedValue<number>>;
  /** May be called in either runtime; native scroll events remain unchanged. */
  reset: () => void;
}

const ElasticHeaderContext = React.createContext<HeaderElasticity | null>(null);

export const ElasticHeaderProvider = ElasticHeaderContext.Provider;

export function useHeaderElasticity(): HeaderElasticity {
  const elasticity = React.useContext(ElasticHeaderContext);
  const zero = useSharedValue(0);
  const reset = React.useCallback(() => {
    'worklet';
    zero.value = 0;
  }, [zero]);

  return elasticity ?? { displacement: zero, reset };
}
