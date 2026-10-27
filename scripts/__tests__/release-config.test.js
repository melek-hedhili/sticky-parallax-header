const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { load } = require('js-yaml');

const manifest = require('../../package.json');

const root = path.resolve(__dirname, '../..');
const workflow = load(fs.readFileSync(path.join(root, '.github/workflows/release.yml'), 'utf8'));
const steps = workflow.jobs.release.steps;
const preflight = steps.find((step) => step.env?.RELEASE_VERSION);

test('publishes the prepared beta through next without a version bump or release branch', () => {
  const release = manifest['release-it'];

  expect(manifest.version).toMatch(/^\d+\.\d+\.\d+-beta\.\d+$/);
  expect(manifest.scripts.release).toBe('release-it --no-increment');
  expect(manifest.publishConfig.tag).toBe('next');
  expect(release.git).toEqual({
    requireBranch: 'master',
    commit: false,
    tagName: 'v${version}',
    push: true,
  });
  expect(release.npm).toMatchObject({ publish: true, tag: 'next' });
  expect(release.github).toMatchObject({ release: true, preRelease: true, makeLatest: false });
  expect(release.hooks).toBeUndefined();
  expect(workflow.on.workflow_dispatch.inputs.version).toMatchObject({
    required: true,
    type: 'string',
    default: manifest.version,
  });
  expect(preflight.env.RELEASE_VERSION).toBe('${{ inputs.version }}');
  expect(steps.find((step) => step.uses?.startsWith('actions/checkout@')).with.ref).toBe(
    '${{ github.ref_name }}'
  );
  expect(steps.map((step) => step.run)).toEqual(
    expect.arrayContaining([
      'yarn check:static',
      'yarn test:ci',
      'yarn test:types',
      'yarn release --ci',
    ])
  );

  const releaseIndex = steps.findIndex((step) => step.run === 'yarn release --ci');

  expect(steps.indexOf(preflight)).toBeLessThan(releaseIndex);
  expect(steps.indexOf(preflight)).toBeLessThan(
    steps.findIndex((step) => step.run === 'yarn install --frozen-lockfile --non-interactive')
  );

  for (const command of ['yarn check:static', 'yarn test:ci', 'yarn test:types']) {
    expect(steps.findIndex((step) => step.run === command)).toBeLessThan(releaseIndex);
  }
});

test('configures npm authentication after validation with tokens scoped to publishing', () => {
  const nodeSetup = steps.find((step) => step.uses?.startsWith('actions/setup-node@'));
  const authentication = steps.filter((step) => step.with?.['registry-url']);
  const publishIndex = steps.findIndex((step) => step.run === 'yarn release --ci');

  expect(nodeSetup.with).not.toHaveProperty('registry-url');
  expect(authentication).toHaveLength(1);
  expect(authentication[0].uses).toBe(nodeSetup.uses);
  expect(authentication[0].with).toEqual({
    'registry-url': 'https://registry.npmjs.org',
    'package-manager-cache': false,
  });

  const authenticationIndex = steps.indexOf(authentication[0]);
  const identityIndex = steps.findIndex((step) => step.name === 'Configure release identity');

  expect(authenticationIndex).toBe(publishIndex - 1);
  expect(identityIndex).toBeGreaterThan(-1);
  expect(authenticationIndex).toBeGreaterThan(identityIndex);
  for (const command of [
    'yarn install --frozen-lockfile --non-interactive',
    'yarn check:static',
    'yarn test:ci',
    'yarn test:types',
  ]) {
    expect(steps.findIndex((step) => step.run === command)).toBeLessThan(authenticationIndex);
  }

  for (const env of [
    workflow.env,
    workflow.jobs.release.env,
    ...steps.slice(0, publishIndex).map((step) => step.env),
  ]) {
    for (const token of ['NODE_AUTH_TOKEN', 'NPM_TOKEN', 'GITHUB_TOKEN']) {
      expect(env || {}).not.toHaveProperty(token);
    }
  }

  expect(steps[publishIndex].env).toEqual({
    NODE_AUTH_TOKEN: '${{ secrets.NPM_TOKEN }}',
    NPM_TOKEN: '${{ secrets.NPM_TOKEN }}',
    GITHUB_TOKEN: '${{ secrets.GH_TOKEN }}',
  });
});

test('validates the GitHub Actions identity before publishing', () => {
  const identity = steps.find((step) => step.name === 'Configure release identity');

  expect(identity.env).toBeUndefined();
  expect(identity.run).toBe(
    'git config user.name "github-actions[bot]"\n' +
      'git config user.email "41898282+github-actions[bot]@users.noreply.github.com"\n' +
      'git var GIT_COMMITTER_IDENT >/dev/null\n'
  );
});

test.each([
  ['refs/heads/master', manifest.version, 0],
  ['refs/heads/feature', manifest.version, 1],
  [`refs/tags/v${manifest.version}`, manifest.version, 1],
  ['refs/heads/master', `${manifest.version}-unexpected`, 1],
  ['refs/heads/master', '2.0.0', 1],
  ['refs/heads/master', `${manifest.version}; echo injected`, 1],
])('release preflight accepts %s with %s only when prepared', (ref, version, status) => {
  const result = spawnSync('bash', ['-e', '-o', 'pipefail', '-c', preflight.run], {
    cwd: root,
    env: { ...process.env, GITHUB_REF: ref, RELEASE_VERSION: version },
    encoding: 'utf8',
  });

  expect(result.error).toBeUndefined();
  expect(result.status).toBe(status);
  expect(result.stdout).toBe('');
});

test.each(['2.0.0', '2.0.0-rc-beta.2', '2.0.0-beta.2+build'])(
  'release preflight rejects noncanonical beta manifest %s even when confirmed',
  (version) => {
    const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'sticky-release-guard-'));

    try {
      fs.writeFileSync(path.join(fixture, 'package.json'), JSON.stringify({ version }));
      const result = spawnSync('bash', ['-e', '-o', 'pipefail', '-c', preflight.run], {
        cwd: fixture,
        env: { ...process.env, GITHUB_REF: 'refs/heads/master', RELEASE_VERSION: version },
        encoding: 'utf8',
      });

      expect(result.status).toBe(1);
      expect(result.stderr).toContain('This workflow only publishes prepared beta versions.');
    } finally {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  }
);
