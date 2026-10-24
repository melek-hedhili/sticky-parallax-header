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

- New Architecture headers using React 19 and Reanimated 4 with Worklets.
- FlashList v2 integrations at `@mhedhili/react-native-sticky-parallax-header/flash-list`.
- One Expo SDK 57 / Expo Router demo, running in Expo Go without prebuild.
- Elastic header pull on Android and iOS, with an `enableHeaderBounce` opt-out.

## Install the beta

```sh
npm install @mhedhili/react-native-sticky-parallax-header@next
# Or, with Yarn:
yarn add @mhedhili/react-native-sticky-parallax-header@next
```

The `2.0.0` beta line contains breaking changes from Netguru's `1.1.1` release.
See the [fork's setup guide](docs/docs/introduction/installation.md) and
[migration notes](docs/docs/introduction/modernization-guide.md) for required
peer dependencies and API differences.

The compatibility update in this checkout accepts React `^19.0.0` and targets
React Native 0.83, 0.86, 0.87 and 0.88 with matched native dependencies. Keep the
React version required by your application; Expo is not a library requirement.
The [dependency matrix and verification limits](docs/docs/introduction/installation.md#dependency-compatibility-targets)
distinguish installation/type checks from native runtime evidence. Published
beta.1 retains its narrower peers until the update is released.

## AI agent skill

The repository includes a portable
[Agent Skill](https://github.com/melek-hedhili/sticky-parallax-header/blob/master/skills/react-native-sticky-parallax-header/SKILL.md) that helps coding
agents choose, implement, customize and migrate the package's public header APIs.
Install the skill directly from this repository:

```sh
npx skills add melek-hedhili/sticky-parallax-header \
  --skill react-native-sticky-parallax-header
```

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
