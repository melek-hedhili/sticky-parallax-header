const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const [platform, ...args] = process.argv.slice(2);
const usage =
  'Use yarn smoke:ios --url exp://HOST:PORT --device "DEVICE" or yarn smoke:android --url exp://HOST:PORT --serial SERIAL. Expo Go must already be installed and Metro must be reachable from the chosen device.';
const urlIndex = args.indexOf('--url');
const urlValue = urlIndex >= 0 ? args[urlIndex + 1] : undefined;
const deviceFlags = ['--device', '--serial', '--udid'];
const hasExplicitDevice = args.some(
  (arg, index) => deviceFlags.includes(arg) && args[index + 1] && !args[index + 1].startsWith('--')
);

if (!['ios', 'android'].includes(platform) || !urlValue || !hasExplicitDevice) {
  throw new Error(usage);
}

const projectUrl = new URL(urlValue);

if (!['exp:', 'exps:'].includes(projectUrl.protocol) || !projectUrl.hostname) {
  throw new Error(`Supply the Expo Go project URL printed by Metro. ${usage}`);
}

// Expo Router's /--/ separator targets the validation menu inside this project.
projectUrl.pathname = '/--/validation';
projectUrl.hash = '';
const deviceArgs = args.filter((_, index) => index !== urlIndex && index !== urlIndex + 1);
const artifactDirectory = path.resolve(__dirname, '../build/smoke', platform);
const replayFile = path.join(artifactDirectory, 'all-cases.ad');

function runAgentDevice(commandArgs) {
  const result = spawnSync('agent-device', commandArgs, { stdio: 'inherit' });

  if (result.error) {
    throw new Error(
      'Install agent-device 0.21.21 on PATH, or run through npm exec --package=agent-device@0.21.21.',
      { cause: result.error }
    );
  }

  if (result.status !== 0) {
    throw new Error(
      `agent-device ${commandArgs[0]} exited ${result.status ?? 'without an exit code'}`
    );
  }
}

fs.mkdirSync(artifactDirectory, { recursive: true });
fs.writeFileSync(
  replayFile,
  `context platform=${platform}\n${fs.readFileSync(path.resolve(__dirname, '../smoke/all-cases.ad'), 'utf8')}`
);

// The replay opens its own session through the installed Expo Go URL handler.
runAgentDevice([
  'test',
  replayFile,
  '--platform',
  platform,
  '--env',
  `PROJECT_URL=${projectUrl.toString()}`,
  '--timeout',
  '600000',
  '--artifacts-dir',
  artifactDirectory,
  ...deviceArgs,
]);
