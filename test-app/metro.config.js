const path = require('path');

const { getDefaultConfig } = require('@react-native/metro-config');

const config = getDefaultConfig(__dirname);

config.watchFolders = [path.resolve(__dirname, '../src')];
const runtimePackages = [
  '@babel/runtime',
  'react',
  'react-native',
  'react-native-reanimated',
  'react-native-worklets',
  'react-native-safe-area-context',
  '@shopify/flash-list',
];
const libraryEntries = {
  'react-native-sticky-parallax-header': '../src/index.tsx',
  'react-native-sticky-parallax-header/flash-list': '../src/flash-list.ts',
};

// Source imports use this app's native runtime, including imports from ../src.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (libraryEntries[moduleName]) {
    return { type: 'sourceFile', filePath: path.resolve(__dirname, libraryEntries[moduleName]) };
  }

  const peer = runtimePackages.find(
    (name) => moduleName === name || moduleName.startsWith(`${name}/`)
  );

  if (peer) {
    return context.resolveRequest(
      { ...context, originModulePath: path.join(__dirname, 'index.js') },
      moduleName,
      platform
    );
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
