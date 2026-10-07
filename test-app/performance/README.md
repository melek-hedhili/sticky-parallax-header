# Isolated performance fixture

`App.tsx` provides nine scenarios: Primitive, Avatar, Details and their FlashList
variants, Tabbed SectionList, Tabbed FlashList and Pager. Lists use 240 local rows;
the pager has six pages of 240 rows each. Only the selected scene mounts, with its
own active scroll hook. Counters track top callbacks, page changes and page
mounts/unmounts; sample them after a capture, since sampling renders the report.

`index.js` is a separate native entrypoint. Normal app entrypoints and navigation
remain unchanged. `../../example/performance/index.js` registers the same fixture
on the Expo lane; its Metro override adds the shared fixture and local assets to
the watch folders. Both lanes resolve library source against their own runtime.

## Source checks and production JS bundles

Use Node 24.21.0 and Yarn Classic 1.22.22, with each app's existing dependency tree.
From `test-app/`:

```sh
node node_modules/typescript/bin/tsc --noEmit --project performance/tsconfig.json
mkdir -p build/performance/android-assets
node node_modules/react-native/cli.js bundle \
  --entry-file performance/index.js --platform android \
  --dev false --minify true --max-workers 2 \
  --bundle-output build/performance/android.js \
  --assets-dest build/performance/android-assets
```

From `example/`:

```sh
node node_modules/typescript/bin/tsc --noEmit --project performance/tsconfig.json
mkdir -p build/performance
for benchmark_platform in ios web; do
  EXPO_OVERRIDE_METRO_CONFIG=performance/metro.config.js \
    node node_modules/@expo/cli/build/bin/cli export:embed \
    --entry-file performance/index.js --platform "$benchmark_platform" \
    --dev false --minify true --max-workers 2 \
    --bundle-output "build/performance/$benchmark_platform.js" \
    --assets-dest "build/performance/$benchmark_platform-assets"
done
```

These routes were verified with the pinned stacks. Expo `export:embed` does not
honor a `--config` override here; `EXPO_OVERRIDE_METRO_CONFIG` is an internal
override verified for this SDK 57 installation, and must be rechecked on upgrades.
Typechecks and JS bundles establish neither native release compilation nor pixel,
gesture or frame-time equivalence.

## Native release comparison

For Gradle or Xcode release packaging, set `ENTRY_FILE` to the absolute path of
the selected app's `performance/index.js`. Their installed RN bundling integrations
support this environment override. Expo additionally needs
`EXPO_OVERRIDE_METRO_CONFIG` pointing to its absolute
`performance/metro.config.js` path. Keep these overrides local to the benchmark
build; the normal entrypoint remains the default.

The pre-edit snapshot recorded on 2026-10-07 is currently at
`/Users/melekhedhili/tmp/sticky-performance-baseline-zxy8kibe/`, containing
`original-source.tar.gz`, `baseline.json` and `working-tree.patch`. This temporary
machine-local record should be copied to durable storage for a handoff.

Prepare baseline and current builds in two isolated checkout copies at the
recorded commit. Restore the recorded pre-existing patch in both, overlay the
archived sources/manifests on the baseline copy, and use the same benchmark
fixtures in both. Apply only the approved runtime optimization diff to the
current copy. Preserve lockfiles, native settings and build options; if installing
dependencies, use `HUSKY=0 yarn install --frozen-lockfile --non-interactive` in each
independent project. Never reset the live working tree to switch benchmark lanes.

Five paired release runs on physical Android and iOS devices remain pending.
Alternate baseline/current order on the same device, use the same refresh rate
and gesture sequence, and warm local images before capture. Record frame-time
percentiles/missed frames, JS time, memory and post-capture counters. Include
vertical collapse/snapping, deep list scrolling, horizontal pager swipes and rapid
tab presses. Emulator interactions provide smoke evidence, not this physical
device performance gate.

Pager mounting defaults and child lifetimes remain fixed. Layout/underline
transform rewrites, cached viewability indexes and private bounded-scroll
candidates remain deferred; scalar tests alone cannot authorize changes to
animation geometry, callback timing or gesture behavior.
