const fs = require('fs');
const path = require('path');

const {
  withAndroidManifest,
  withDangerousMod,
  withAndroidColors,
  withExpoPlist,
} = require('expo/config-plugins');

// Settings previously stored only in generated Expo 45 native projects.
module.exports = function withNativeSettings(config) {
  config = withAndroidManifest(config, (mod) => {
    const app = mod.modResults.manifest.application[0];

    app.$['android:usesCleartextTraffic'] = 'true';
    const activity = app.activity.find((item) => item.$['android:name'] === '.MainActivity');
    const scheme = 'com.reactnativestickyparallaxheaderexample';
    const filters = activity['intent-filter'] || [];

    if (
      !filters.some((filter) => filter.data?.some((data) => data.$['android:scheme'] === scheme))
    ) {
      filters.push({
        action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
        category: [
          { $: { 'android:name': 'android.intent.category.DEFAULT' } },
          { $: { 'android:name': 'android.intent.category.BROWSABLE' } },
        ],
        data: [{ $: { 'android:scheme': scheme } }],
      });
    }

    activity['intent-filter'] = filters;
    // This example never linked expo-updates; SDK 45 metadata was inactive.
    app['meta-data'] = (app['meta-data'] || []).filter(
      (item) => !item.$['android:name'].startsWith('expo.modules.updates.')
    );

    return mod;
  });
  config = withAndroidColors(config, (mod) => {
    const colors = mod.modResults.resources.color || [];

    for (const [name, value] of Object.entries({
      colorPrimary: '#023c69',
      colorPrimaryDark: '#ffffff',
    })) {
      const color = colors.find((item) => item.$.name === name);

      if (color) color._ = value;
      else colors.push({ $: { name }, _: value });
    }

    mod.modResults.resources.color = colors;

    return mod;
  });
  config = withExpoPlist(config, (mod) => {
    for (const key of Object.keys(mod.modResults)) {
      if (key.startsWith('EXUpdates')) delete mod.modResults[key];
    }

    return mod;
  });
  config = withDangerousMod(config, [
    'android',
    async (mod) => {
      const resourceRoot = path.join(mod.modRequest.platformProjectRoot, 'app/src/main/res');
      const sourceRoot = path.join(mod.modRequest.projectRoot, 'native-assets/android');

      for (const density of fs.readdirSync(sourceRoot)) {
        const target = path.join(resourceRoot, density);

        fs.mkdirSync(target, { recursive: true });
        for (const name of fs.readdirSync(path.join(sourceRoot, density))) {
          fs.rmSync(path.join(target, name.replace(/\.png$/, '.webp')), { force: true });
          fs.copyFileSync(path.join(sourceRoot, density, name), path.join(target, name));
        }
      }

      return mod;
    },
  ]);
  config = withDangerousMod(config, [
    'ios',
    async (mod) => {
      const nativeRoot = mod.modRequest.platformProjectRoot;
      const projectName = fs.readdirSync(nativeRoot).find((name) => name.endsWith('.xcodeproj'));
      const schemes = path.join(nativeRoot, projectName, 'xcshareddata/xcschemes');
      const name = projectName.replace('.xcodeproj', '');
      const iconPath = path.join(nativeRoot, name, 'Images.xcassets/AppIcon.appiconset');

      // The original project has an empty icon catalog; do not add Expo's template logo.
      fs.rmSync(path.join(iconPath, 'App-Icon-1024x1024@1x.png'), { force: true });
      fs.copyFileSync(
        path.join(mod.modRequest.projectRoot, 'native-assets/ios/AppIcon.appiconset/Contents.json'),
        path.join(iconPath, 'Contents.json')
      );
      const original = fs.readFileSync(path.join(schemes, `${name}.xcscheme`), 'utf8');
      // Derive from the generated scheme so target UUIDs stay valid after every prebuild.
      const release = original.replace(
        /(<LaunchAction[\s\S]*?buildConfiguration = ")Debug(")/,
        '$1Release$2'
      );

      fs.writeFileSync(path.join(schemes, `${name}release.xcscheme`), release);

      return mod;
    },
  ]);

  return config;
};
