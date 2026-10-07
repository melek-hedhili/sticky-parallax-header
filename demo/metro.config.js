const path = require('path');

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const libraryRoot = path.resolve(__dirname, '../src');
const runtimePackages = [
  '@babel/runtime',
  'react',
  'react-dom',
  'react-native',
  'react-native-web',
  'react-native-reanimated',
  'react-native-worklets',
  'react-native-safe-area-context',
  '@shopify/flash-list',
];
const libraryEntries = {
  'react-native-sticky-parallax-header': path.join(libraryRoot, 'index.tsx'),
  'react-native-sticky-parallax-header/flash-list': path.join(libraryRoot, 'flash-list.ts'),
};

config.watchFolders = [libraryRoot];
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (libraryEntries[moduleName]) {
    return { type: 'sourceFile', filePath: libraryEntries[moduleName] };
  }

  if (moduleName.startsWith('@/')) {
    return context.resolveRequest(
      context,
      path.join(__dirname, 'src', moduleName.slice(2)),
      platform
    );
  }

  const peer = runtimePackages.find(
    (name) => moduleName === name || moduleName.startsWith(`${name}/`)
  );

  if (peer) {
    return context.resolveRequest(
      { ...context, originModulePath: path.join(__dirname, 'package.json') },
      moduleName,
      platform
    );
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
