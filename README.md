# React Native Sticky Parallax Header

Composable sticky and parallax headers for React Native, with custom primitives,
Avatar and Details layouts, tabbed lists, a horizontal pager, and optional FlashList
integrations. Originally developed by Netguru; distributed under the [MIT license](LICENSE).

This checkout contains the modernization for the next breaking major release.
Published 1.x releases and their documentation describe the older stack. Build or
pack this checkout to evaluate the modern implementation; publication is a separate step.

## Supported stacks

New Architecture is required. The two validation lanes are:

| Dependency            | Expo example         | Bare React Native test app |
| --------------------- | -------------------- | -------------------------- |
| Expo                  | 57.0.26              | Not used                   |
| React Native          | 0.86.3               | 0.87.1                     |
| React                 | 19.2.3               | 19.2.3                     |
| Reanimated / Worklets | 4.5.1 / 0.10.1       | 4.7.1 / 0.13.0             |
| FlashList, when used  | 2.0.2                | 2.3.3                      |
| Safe Area Context     | Expo-supported 5.7.x | 5.10.1                     |

Use the paired animation dependencies for your lane. Expo projects should use
`expo install` for SDK-managed dependencies. React stays aligned with the native
renderer; an independent npm latest tag is not a compatibility guarantee.

Package static checks, 28 regression tests, both app source typechecks, and the documentation build pass locally. Android interaction checks cover selected example screens. Strict packed-consumer type checks remain blocked by upstream declarations in the selected React Native, Reanimated, and FlashList versions; the gate remains enabled. iOS/web interaction coverage, RTL, rotation, and accessibility font sizes require further validation.

## Usage

Wrap the app with `SafeAreaProvider` and render a predefined layout:

```tsx
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DetailsHeaderScrollView } from 'react-native-sticky-parallax-header';

export function App() {
  return (
    <SafeAreaProvider>
      <DetailsHeaderScrollView title="Explore" backgroundColor="#2457C5">
        <Text>Scroll content goes here.</Text>
      </DetailsHeaderScrollView>
    </SafeAreaProvider>
  );
}
```

Core exports include `StickyHeaderScrollView`, `StickyHeaderFlatList`,
`StickyHeaderSectionList`, the Avatar/Details list variants, `TabbedHeaderList`,
`TabbedHeaderPager`, and composition hooks/HOCs. Primitives provide sticky layout;
compose `useStickyHeaderScrollProps` when a custom header also needs snapping.
Scroll callbacks are worklets; JS side effects require Worklets scheduling.

FlashList integrations have their own entrypoint:

```tsx
import { FlashList } from '@shopify/flash-list';
import { withAvatarHeaderFlashList } from 'react-native-sticky-parallax-header/flash-list';

const AvatarFlashList = withAvatarHeaderFlashList<{ id: string; label: string }>(FlashList);
```

Install FlashList v2 only when using that entrypoint. FlashList HOCs, its scroll
hook, and its integration prop types are no longer exported from the core entry.
Core consumers do not need FlashList installed. Integrations default
`maintainVisibleContentPosition` to `{ disabled: true }`; explicit caller settings
are respected. Remove old size-estimation props when migrating from FlashList v1.

See the [modern migration guide](docs/docs/introduction/modernization-guide.md),
[installation and compatibility notes](docs/docs/introduction/installation.md),
and [custom examples](docs/docs/examples/custom-header.md). Historical 1.x/0.4.x
API pages remain archived under `docs/versioned_docs/`.

## Development

Use Node **24.21.0** (`.nvmrc`) and Yarn Classic **1.22.22**. Each project has its
own manifest, dependencies, and Yarn lockfile. Read [CONTRIBUTING.md](CONTRIBUTING.md)
for explicit setup and native prerequisites.

```sh
yarn check:static
yarn test:ci
yarn test:types
```

The packed-consumer gate creates isolated temporary projects and may install
packages. It verifies both supported stacks, including core consumption without
FlashList. Unit tests use JS/native mocks and do not prove UI-thread animations.

```sh
yarn example ios
yarn example android
yarn example web
yarn test-app ios
yarn test-app android
yarn --cwd docs start
```

The [Expo example](example/README.md) provides the full demo. The
[bare test app](test-app/README.md) provides deterministic cases for current RN.
The checks workflow covers static checks, regression tests, package declarations,
bundles, docs, and native builds. Actual interaction evidence is recorded separately.
