# React Native Sticky Parallax Header

A fork of [Netguru's Sticky Parallax Header](https://github.com/netguru/sticky-parallax-header),
a React Native library for custom sticky and parallax headers.

Original Netguru previews:

| Tabbed Header | Avatar Header | Details Header |
| :---: | :---: | :---: |
| ![Tabbed header animation](assets/readme_TabbedHeader.gif) | ![Avatar header animation](assets/readme_AvatarHeader.gif) | ![Details header animation](assets/readme_DetailsHeader.gif) |

See the [original API documentation](https://netguru.github.io/sticky-parallax-header/)
for component usage and examples.

## This fork

- New Architecture support for React Native 0.86/0.87 and Reanimated 4 with Worklets.
- FlashList v2 integrations at `@mhedhili/react-native-sticky-parallax-header/flash-list`.
- One Expo SDK 57 / Expo Router demo, running in Expo Go without prebuild.
- Elastic header pull on Android and iOS, with an `enableHeaderBounce` opt-out.

## Install the beta

```sh
yarn add @mhedhili/react-native-sticky-parallax-header@next
```

The `2.0.0-beta.0` line contains breaking changes from Netguru's `1.1.1` release.
See the [fork's setup guide](docs/docs/introduction/installation.md) and
[migration notes](docs/docs/introduction/modernization-guide.md) for required
peer dependencies and API differences.

## Try the demo

Use Node **24.21.0** and Yarn Classic **1.22.22**:

```sh
yarn install --frozen-lockfile
yarn --cwd demo install --frozen-lockfile
yarn demo start
```

Scan the QR code with Expo Go. See the [demo guide](demo/README.md) for platform
commands and [contributor guide](CONTRIBUTING.md) for development and checks.

[MIT License](LICENSE) · Original library by [Netguru](https://github.com/netguru/sticky-parallax-header).
