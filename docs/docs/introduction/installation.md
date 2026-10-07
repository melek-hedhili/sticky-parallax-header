---
sidebar_position: 2
---

# Installation

The modern branch requires React 19, React Native's **New Architecture** and
Reanimated 4. Reanimated 2/3, FlashList 1 and the legacy architecture are outside
this branch's compatibility target.

## Supported dependency pairs

Install one complete set. Expo's supported native dependencies can differ from
the newest bare React Native packages.

| Dependency            | Expo demo | Bare consumer type lane |
| --------------------- | --------- | ----------------------- |
| Expo                  | 57.0.27   | Not required            |
| React Native          | 0.86.3    | 0.87.1                  |
| React                 | 19.2.3    | 19.2.3                  |
| Reanimated            | 4.5.1     | 4.7.1                   |
| React Native Worklets | 0.10.1    | 0.13.0                  |
| Safe Area Context     | 5.7.x     | 5.10.1                  |
| FlashList, optional   | 2.0.2     | 2.3.3                   |

These are the repository's dependency targets. The Expo demo provides runtime
scenarios; the bare lane is retained in isolated package type checks. A successful
JavaScript bundle or unit test does not establish native animation behavior.
Use Node 24.21.0 and Yarn Classic 1.22.22 when contributing to this repository.

## Use this checkout before publication

The Next documentation does not imply that the modern branch has been published
to npm. To test the checkout, build and pack it from the repository root:

```sh
yarn build
yarn pack --filename react-native-sticky-parallax-header.tgz
```

Install that archive in your application using its actual local path. Once a
modern release is published, use that release's explicit version; the old `@rc`
installation command is not a compatibility guarantee.

## Expo

Within an Expo 57 application, let Expo select its compatible native packages:

```sh
npx expo install react-native-reanimated react-native-worklets react-native-safe-area-context
```

Keep `babel-preset-expo` in the application's Babel config. It configures the
Worklets transform for the installed Expo/Reanimated stack. Do not configure the
old Reanimated plugin as a second copy of the same transform. The repository demo
runs in Expo Go without prebuild or native projects. Custom consumer applications
need a new native binary when they change native dependencies.

## Bare React Native

For the React Native 0.87.1 target:

```sh
yarn add react-native-reanimated@4.7.1 react-native-worklets@0.13.0 react-native-safe-area-context@5.10.1
```

Configure the Worklets plugin **last** in the application's Babel plugins:

```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-worklets/plugin'],
};
```

Follow the [Reanimated installation guide](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation/),
install iOS Pods, and rebuild the native app. Restart Metro with its cache reset
after changing the Babel configuration.

## Safe areas

Place a `SafeAreaProvider` above your navigation/screens. If the application
already has one, use that provider.

```tsx
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AvatarHeaderScrollView } from 'react-native-sticky-parallax-header';

export default function App() {
  return (
    <SafeAreaProvider>
      <AvatarHeaderScrollView
        containerStyle={{ flex: 1 }}
        title="My profile"
        subtitle="A sticky header"
        backgroundColor="#126b5e">
        <Text style={{ padding: 24, minHeight: 1000 }}>Scroll to collapse the header.</Text>
      </AvatarHeaderScrollView>
    </SafeAreaProvider>
  );
}
```

## Optional FlashList integration

Use `npx expo install @shopify/flash-list` with Expo, or install
`@shopify/flash-list@2.3.3` for the bare target. All FlashList APIs live under the
`/flash-list` subpath; see [FlashList headers](../headers/flashlist-headers.md).

Core `ScrollView`, `FlatList`, `SectionList` and pager headers work without
installing FlashList. Web-specific constraints are described in
[web support](./web-support.md).
