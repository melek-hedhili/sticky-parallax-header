import { FocusedScene } from '@/components/focused-scene';
import { PerformanceMenu } from '@/performance/performance-menu';

export default function PerformanceIndexRoute() {
  return (
    <FocusedScene>
      <PerformanceMenu />
    </FocusedScene>
  );
}
