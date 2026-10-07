const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const outputDirectory = path.join(projectRoot, '.expo/types');

process.env.EXPO_ROUTER_APP_ROOT = path.join(projectRoot, 'app');

// Use the SDK's generator, as Expo CLI does, without starting Metro or rewriting config.
// Recheck these SDK-internal entrypoints when upgrading Expo.
const {
  getTypedRoutesDeclarationFile,
} = require('@expo/router-server/build/typed-routes/generate');
const { EXPO_ROUTER_CTX_IGNORE } = require('expo-router/_ctx-shared');
const { requireContext } = require('expo-router/internal/testing');
const context = requireContext(process.env.EXPO_ROUTER_APP_ROOT, true, EXPO_ROUTER_CTX_IGNORE);
const declaration = getTypedRoutesDeclarationFile(context, {});

if (!declaration) {
  throw new Error('Expo Router did not generate route declarations.');
}

fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(path.join(outputDirectory, 'router.d.ts'), declaration);
fs.writeFileSync(path.join(projectRoot, 'expo-env.d.ts'), '/// <reference types="expo/types" />\n');
