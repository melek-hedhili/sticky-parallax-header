const { spawnSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const temporaryRoot = fs.mkdtempSync(
  path.join(process.env.PACKED_CONSUMER_TMPDIR || os.tmpdir(), 'sticky-parallax-consumers-')
);
const yarn = process.env.npm_execpath;
const realRoot = fs.realpathSync(root);
const realTemporaryRoot = fs.realpathSync(temporaryRoot);

if (realTemporaryRoot === realRoot || realTemporaryRoot.startsWith(`${realRoot}${path.sep}`)) {
  throw new Error('Packed consumers must be created outside the repository dependency tree.');
}

function run(command, args, cwd = root) {
  // eslint-disable-next-line no-console
  console.log(`[packed-consumer] ${command} ${args.join(' ')} (${cwd})`);

  const result = spawnSync(command, args, {
    cwd,
    env: { ...process.env, HUSKY: '0' },
    stdio: 'inherit',
  });

  if (result.error || result.status !== 0) {
    throw result.error || new Error(`${command} ${args[0]} exited ${result.status}`);
  }
}

function runYarn(args, cwd = root) {
  run(yarn ? process.execPath : 'yarn', yarn ? [yarn, ...args] : args, cwd);
}

const coreSource = `
import * as React from 'react';
import type * as CommonJS from '@mhedhili/react-native-sticky-parallax-header' with { 'resolution-mode': 'require' };
import { FlatList, ScrollView, SectionList, Text, View } from 'react-native';
import {
  AvatarHeaderFlatList, AvatarHeaderScrollView, AvatarHeaderSectionList,
  DetailsHeaderFlatList, DetailsHeaderScrollView, DetailsHeaderSectionList,
  StickyHeaderFlatList, StickyHeaderScrollView, StickyHeaderSectionList,
  TabbedHeaderList, TabbedHeaderPager, useStickyHeaderProps, useStickyHeaderScrollProps, withStickyHeader,
  type PagerMethods,
} from '@mhedhili/react-native-sticky-parallax-header';

type Item = { id: string; label: string };
type Section = { key: string; title: string };
const data: Item[] = [{ id: 'one', label: 'One' }];
const sections = [{ key: 'one', title: 'One', data }];
const renderItem = ({ item }: { item: Item }) => <Text>{item.label}</Text>;
const scrollRef = React.createRef<React.ComponentRef<typeof ScrollView>>();
const flatRef = React.createRef<React.ComponentRef<typeof FlatList<Item>>>();
const sectionRef = React.createRef<React.ComponentRef<typeof SectionList<Item, Section>>>();
const header = () => <Text>Header</Text>;
const pagerRef = React.createRef<PagerMethods>();
const CustomScroll = withStickyHeader(ScrollView);
export const commonJSAvatar: typeof CommonJS.AvatarHeaderScrollView = AvatarHeaderScrollView;

export function CoreConsumer() {
  const scroll = useStickyHeaderScrollProps<React.ComponentRef<typeof ScrollView>>({ parallaxHeight: 180, snapToEdge: true });
  const layout = useStickyHeaderProps({ stickyTabs: true });
  // @ts-expect-error Internal gesture state is not part of the public layout hook.
  layout.elasticity;
  return <View>
    <StickyHeaderScrollView onScroll={scroll.onScroll} onMomentumScrollEnd={scroll.onMomentumScrollEnd} onScrollEndDrag={scroll.onScrollEndDrag} ref={scroll.scrollViewRef} renderHeader={header}><Text>Body</Text></StickyHeaderScrollView>
    <CustomScroll ref={scrollRef} renderHeader={header}><Text>Custom body</Text></CustomScroll>
    <StickyHeaderFlatList<Item> ref={flatRef} data={data} renderItem={({ item }) => <Text>{item.label}</Text>} renderHeader={header} />
    <StickyHeaderSectionList<Item, Section> ref={sectionRef} sections={sections} renderItem={renderItem} />
    <AvatarHeaderScrollView ref={scrollRef} title="Avatar" enableHeaderBounce={false}><Text>Body</Text></AvatarHeaderScrollView>
    <AvatarHeaderFlatList<Item> ref={flatRef} title="Avatar" data={data} renderItem={renderItem} />
    <AvatarHeaderSectionList<Item, Section> ref={sectionRef} title="Avatar" sections={sections} renderItem={renderItem} />
    <DetailsHeaderScrollView ref={scrollRef} title="Details" enableHeaderBounce={true}><Text>Body</Text></DetailsHeaderScrollView>
    <DetailsHeaderFlatList<Item> ref={flatRef} title="Details" data={data} renderItem={renderItem} />
    <DetailsHeaderSectionList<Item, Section> ref={sectionRef} title="Details" sections={sections} renderItem={renderItem} />
    <TabbedHeaderList<Item, Section> ref={sectionRef} sections={sections} renderItem={renderItem} tabs={[{title: 'One'}]} />
    <TabbedHeaderPager ref={scrollRef} enableHeaderBounce={false} pagerProps={{ref: pagerRef}} tabs={[{title: 'One'}]}><Text>Page</Text></TabbedHeaderPager>
  </View>;
}

// @ts-expect-error Native scroll refs must not accept arbitrary numbers.
const badRef: React.ComponentProps<typeof StickyHeaderScrollView>['ref'] = React.createRef<number>();
// @ts-expect-error Item generic inference must reject the wrong data shape.
const badItem = <StickyHeaderFlatList<Item> data={[{ id: 'missing-label' }]} renderItem={renderItem} />;
// @ts-expect-error Inferred items must not silently degrade to any.
const badInference = <AvatarHeaderFlatList data={data} renderItem={({ item }) => <Text>{item.missing}</Text>} />;
// @ts-expect-error Section metadata must retain its declared shape.
const badSection = <TabbedHeaderList<Item, Section> sections={[{ data, key: 'one' }]} renderItem={renderItem} />;
// @ts-expect-error Pager navigation requires a numeric page.
pagerRef.current?.goToPage('one');
// @ts-expect-error FlashList adapters must not leak through the core entry point.
import { withStickyHeaderFlashList } from '@mhedhili/react-native-sticky-parallax-header';
`;

const flashSource = `
import * as React from 'react';
import type * as CommonJS from '@mhedhili/react-native-sticky-parallax-header/flash-list' with { 'resolution-mode': 'require' };
import { Text, View } from 'react-native';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { useStickyHeaderProps } from '@mhedhili/react-native-sticky-parallax-header';
import {
  useStickyHeaderFlashListScrollProps, withStickyHeaderFlashList,
  withAvatarHeaderFlashList, withDetailsHeaderFlashList, withTabbedHeaderFlashList,
  type StickyHeaderFlashListProps, type AvatarHeaderFlashListProps,
  type DetailsHeaderFlashListProps, type TabbedHeaderFlashListProps,
} from '@mhedhili/react-native-sticky-parallax-header/flash-list';

type Item = { id: string; label: string };
const data: Item[] = [{ id: 'one', label: 'One' }];
const renderItem = ({ item }: { item: Item }) => <Text>{item.label}</Text>;
const Sticky = withStickyHeaderFlashList(FlashList<Item>);
const Avatar = withAvatarHeaderFlashList<Item>(FlashList);
const Details = withDetailsHeaderFlashList<Item>(FlashList);
const Tabs = withTabbedHeaderFlashList<Item>(FlashList);
const ref = React.createRef<FlashListRef<Item>>();
export const commonJSAdapter: typeof CommonJS.withAvatarHeaderFlashList = withAvatarHeaderFlashList;

export function FlashConsumer() {
  const scroll = useStickyHeaderFlashListScrollProps<FlashListRef<Item>>({snapToEdge: true});
  const layout = useStickyHeaderProps({ stickyTabs: true });
  // @ts-expect-error Internal gesture state is not part of the public layout hook.
  layout.elasticity;
  return <View>
    <Sticky onScroll={scroll.onScroll} onMomentumScrollEnd={scroll.onMomentumScrollEnd} onScrollEndDrag={scroll.onScrollEndDrag} ref={scroll.scrollViewRef} data={data} renderItem={renderItem} />
    <Avatar ref={ref} title="Avatar" enableHeaderBounce={false} data={data} renderItem={renderItem} />
    <Details ref={ref} title="Details" enableHeaderBounce={true} data={data} renderItem={renderItem} />
    <Tabs ref={ref} enableHeaderBounce={false} data={data} renderItem={renderItem} stickyHeaderIndices={[0]} tabs={[{title:'One'}]} />
  </View>;
}

export type IntegrationProps = StickyHeaderFlashListProps<Item> | AvatarHeaderFlashListProps<Item> | DetailsHeaderFlashListProps<Item> | TabbedHeaderFlashListProps<Item>;
// @ts-expect-error The adapter must preserve the item shape.
const badItem = <Avatar data={[{ id: 'missing-label' }]} renderItem={renderItem} />;
// @ts-expect-error Modern FlashList refs must not accept an unrelated instance.
const badRef = <Details ref={React.createRef<number>()} data={data} renderItem={renderItem} />;
// @ts-expect-error FlashList 2 removed estimatedItemSize.
const badEstimate = <Sticky data={data} renderItem={renderItem} estimatedItemSize={40} />;
`;

const lanes = [
  {
    name: 'rn-0.83.0',
    react: '19.2.0',
    reactTypes: '19.2.18',
    native: '0.83.0',
    gestureHandler: '2.30.0',
    reanimated: '4.2.1',
    worklets: '0.7.4',
    safeArea: '5.6.2',
    flash: '2.0.2',
  },
  {
    name: 'rn-0.83.10',
    react: '19.2.0',
    reactTypes: '19.2.18',
    native: '0.83.10',
    gestureHandler: '2.30.0',
    reanimated: '4.2.1',
    worklets: '0.7.4',
    safeArea: '5.6.2',
    flash: '2.0.2',
  },
  {
    name: 'rn-0.86.3',
    react: '19.2.3',
    reactTypes: '19.2.18',
    native: '0.86.3',
    gestureHandler: '2.32.0',
    reanimated: '4.5.1',
    worklets: '0.10.1',
    safeArea: '5.7.0',
    flash: '2.0.2',
  },
  {
    name: 'rn-0.87.1',
    react: '19.2.3',
    reactTypes: '19.2.18',
    native: '0.87.1',
    gestureHandler: '2.32.0',
    reanimated: '4.7.1',
    worklets: '0.13.0',
    safeArea: '5.10.1',
    flash: '2.3.3',
  },
  {
    name: 'rn-0.88.0',
    react: '19.3.0',
    reactTypes: '19.3.0',
    native: '0.88.0',
    gestureHandler: '3.3.0',
    reanimated: '4.7.1',
    worklets: '0.13.0',
    safeArea: '5.10.1',
    flash: '2.3.3',
  },
];

function install(cwd) {
  const flags = [
    'install',
    '--strict-peer-deps',
    '--legacy-peer-deps=false',
    '--force=false',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    '--fetch-retries=0',
    '--fetch-timeout=30000',
    '--registry=https://registry.npmjs.org',
  ];

  if (process.env.PACKED_CONSUMER_OFFLINE === '1') {
    flags.push('--offline');
  }

  run(process.platform === 'win32' ? 'npm.cmd' : 'npm', flags, cwd);
}

function verifyInstalledVersions(cwd, dependencies) {
  for (const [name, expected] of Object.entries(dependencies)) {
    if (expected.startsWith('file:')) {
      continue;
    }

    const installed = JSON.parse(
      fs.readFileSync(path.join(cwd, 'node_modules', name, 'package.json'), 'utf8')
    );

    if (installed.version !== expected) {
      throw new Error(`${name}: expected ${expected}, installed ${installed.version}`);
    }
  }
}

function verifyDeclarationResolution(cwd, entry) {
  const typescript = require(path.join(cwd, 'node_modules/typescript'));

  for (const [format, resolutionMode] of [
    ['module', typescript.ModuleKind.ESNext],
    ['commonjs', typescript.ModuleKind.CommonJS],
  ]) {
    const result = typescript.resolveModuleName(
      entry,
      path.join(cwd, 'core.tsx'),
      { moduleResolution: typescript.ModuleResolutionKind.Bundler },
      typescript.sys,
      undefined,
      undefined,
      resolutionMode
    );
    const filename = entry.endsWith('/flash-list') ? 'flash-list.d.ts' : 'index.d.ts';
    const expected = path.join(
      cwd,
      'node_modules/@mhedhili/react-native-sticky-parallax-header/lib/typescript',
      format,
      filename
    );

    if (result.resolvedModule?.resolvedFileName !== expected) {
      throw new Error(`${entry} ${format} did not resolve to the installed packed declarations.`);
    }
  }
}

function verifyArchiveContents(archive) {
  const result = spawnSync('tar', ['-tzf', archive], { encoding: 'utf8' });

  if (result.error || result.status !== 0) {
    throw result.error || new Error('Unable to inspect the packed archive.');
  }

  const entries = result.stdout.split('\n');
  const forbidden = entries.filter((entry) => {
    const relative = entry.replace(/^package\//, '');

    if (!entry || entry === 'package' || !relative) {
      return false;
    }

    return (
      !/^(?:package\.json|README(?:\.[^/]*)?|LICENSE(?:\.[^/]*)?|CHANGELOG\.md|(?:src|lib)(?:\/.*)?)$/i.test(
        relative
      ) ||
      /(?:^|\/)(?:demo|__tests__|__fixtures__|__mocks__|node_modules|\.agents|\.claude)(?:\/|$)/.test(
        relative
      )
    );
  });

  if (forbidden.length > 0) {
    throw new Error(`Archive includes non-package files: ${forbidden.slice(0, 10).join(', ')}`);
  }

  const shipped = new Set(entries.map((entry) => entry.replace(/^package\//, '')));
  const expected = [];

  function collectProductionFiles(directory) {
    for (const entry of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
      if (
        /^(?:__tests__|__fixtures__|__mocks__)$/.test(entry.name) ||
        /\.(?:test|spec)\./.test(entry.name)
      ) {
        continue;
      }

      const relative = `${directory}/${entry.name}`;

      if (entry.isDirectory()) {
        collectProductionFiles(relative);
      } else if (entry.isFile()) {
        expected.push(relative);
      }
    }
  }

  collectProductionFiles('src');
  collectProductionFiles('lib');
  const missing = expected.filter((entry) => !shipped.has(entry));

  if (missing.length > 0) {
    throw new Error(`Archive omits production files; update the whitelist: ${missing.join(', ')}`);
  }

  // eslint-disable-next-line no-console
  console.log(
    `[packed-consumer] Archive verified: ${expected.length} production source/build files.`
  );
}

try {
  const packedArchive = path.join(temporaryRoot, 'library.tgz');
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const failures = [];

  if (packageJson.files?.some((entry) => entry.startsWith('!'))) {
    throw new Error(
      'Yarn Classic requires a positive files whitelist; put exclusions in .npmignore.'
    );
  }

  for (const entry of ['.', './flash-list']) {
    for (const condition of ['import', 'require']) {
      const declaration = packageJson.exports[entry][condition].types;

      if (!fs.existsSync(path.resolve(root, declaration))) {
        throw new Error(`Missing built ${entry} ${condition} declarations; run yarn build first.`);
      }
    }
  }

  runYarn(['pack', '--filename', packedArchive]);
  verifyArchiveContents(packedArchive);
  // A content-addressed filename prevents a cached archive from masking this built snapshot.
  const archiveHash = createHash('sha256').update(fs.readFileSync(packedArchive)).digest('hex');
  const archive = path.join(temporaryRoot, `library-${archiveHash}.tgz`);

  fs.renameSync(packedArchive, archive);
  for (const lane of lanes) {
    for (const withFlashList of [false, true]) {
      const description = `${lane.name}-${withFlashList ? 'flash' : 'core'}`;
      const cwd = path.join(temporaryRoot, description);

      fs.mkdirSync(cwd);
      const manifest = {
        name: `sticky-parallax-${description}-consumer`,
        private: true,
        dependencies: {
          '@mhedhili/react-native-sticky-parallax-header': `file:${archive}`,
          'react': lane.react,
          'react-native': lane.native,
          'react-native-gesture-handler': lane.gestureHandler,
          'react-native-reanimated': lane.reanimated,
          'react-native-worklets': lane.worklets,
          'react-native-safe-area-context': lane.safeArea,
          '@babel/core': '7.29.7',
          '@react-native/metro-config': lane.native,
          '@types/react': lane.reactTypes,
          'typescript': '6.0.3',
        },
      };

      if (withFlashList) {
        manifest.dependencies['@shopify/flash-list'] = lane.flash;
        fs.writeFileSync(path.join(cwd, 'flash.tsx'), flashSource);
      }

      fs.writeFileSync(path.join(cwd, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`);
      fs.writeFileSync(
        path.join(cwd, 'tsconfig.json'),
        JSON.stringify(
          {
            compilerOptions: {
              strict: true,
              skipLibCheck: false,
              noEmit: true,
              jsx: 'react-jsx',
              module: 'ESNext',
              moduleResolution: 'Bundler',
              target: 'ES2022',
              lib: ['ES2022'],
              types: ['react'],
            },
            include: ['*.tsx'],
          },
          null,
          2
        )
      );
      fs.writeFileSync(path.join(cwd, 'core.tsx'), coreSource);
      try {
        install(cwd);
        verifyInstalledVersions(cwd, manifest.dependencies);
        if (!withFlashList && fs.existsSync(path.join(cwd, 'node_modules/@shopify/flash-list'))) {
          throw new Error('Core consumer unexpectedly has FlashList installed.');
        }

        // eslint-disable-next-line no-console
        console.log(`[packed-consumer] ${description}: installation passed.`);
      } catch (error) {
        failures.push(`${description} installation: ${error.message}`);
        continue;
      }

      try {
        verifyDeclarationResolution(cwd, '@mhedhili/react-native-sticky-parallax-header');
        if (withFlashList) {
          verifyDeclarationResolution(
            cwd,
            '@mhedhili/react-native-sticky-parallax-header/flash-list'
          );
        }

        run(process.execPath, [path.join(cwd, 'node_modules/typescript/bin/tsc'), '--noEmit'], cwd);
        // eslint-disable-next-line no-console
        console.log(`[packed-consumer] ${description}: compilation passed.`);
      } catch (error) {
        failures.push(`${description} compilation: ${error.message}`);
      }
    }
  }

  if (failures.length > 0) {
    throw new Error(`Strict packed consumer checks failed:\n${failures.join('\n')}`);
  }

  // eslint-disable-next-line no-console
  console.log(
    `Packed installation and declarations passed on all ${lanes.length} dependency stacks.`
  );
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
} catch (error) {
  console.error(`Consumer evidence retained at ${temporaryRoot}`);
  throw error;
}
