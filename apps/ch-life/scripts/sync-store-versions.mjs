import { readFile, writeFile } from 'node:fs/promises';

const APP_STORE_ID = '6772700147';
const APP_IDENTIFIER = 'com.leejaejin.chlife';
const PUBLISHED_JSON =
  'https://zzzryt.github.io/ch-notes/app-version.json';
const OUTPUT = new URL('../../../website/app-version.json', import.meta.url);
const VERSION_PATTERN = /^\d+(\.\d+)*$/;

function assertVersion(version, store) {
  if (
    typeof version !== 'string' ||
    !VERSION_PATTERN.test(version) ||
    version.split('.').some((part) => !Number.isSafeInteger(Number(part)))
  ) {
    throw new Error(`${store} returned an invalid version`);
  }
  return version;
}

function compareVersions(left, right) {
  const a = left.split('.').map(Number);
  const b = right.split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const difference = (a[i] ?? 0) - (b[i] ?? 0);
    if (difference) return Math.sign(difference);
  }
  return 0;
}

async function fetchText(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(15_000),
    headers: { 'user-agent': 'ch-life-store-version-sync/1.0' },
  });
  if (!response.ok) throw new Error(`Store request failed (${response.status})`);
  return response.text();
}

async function fetchIosVersion() {
  const body = JSON.parse(
    await fetchText(`https://itunes.apple.com/lookup?id=${APP_STORE_ID}&country=kr`),
  );
  const app = body.results?.find((result) => result.bundleId === APP_IDENTIFIER);
  if (!app) throw new Error('App Store listing was not found');
  return assertVersion(app.version, 'App Store');
}

async function fetchAndroidVersion() {
  const html = await fetchText(
    `https://play.google.com/store/apps/details?id=${APP_IDENTIFIER}&hl=ko&gl=KR`,
  );
  // ponytail: Google has no public version API; read its listing payload and fail closed
  // if its private field changes. Use Publisher API when CI can map published codes to names.
  const version = html.match(/"141":\[\[\["([^"\\]+)"\]\]/)?.[1];
  if (!version) throw new Error('Play Store version field was not found');
  return assertVersion(version, 'Play Store');
}

const previousJson = await readFile(OUTPUT, 'utf8');
const previous = JSON.parse(previousJson);
try {
  const published = JSON.parse(await fetchText(PUBLISHED_JSON));
  for (const platform of ['ios', 'android']) {
    const version = assertVersion(published[platform], `${platform} published fallback`);
    if (compareVersions(version, assertVersion(previous[platform], platform)) > 0) {
      previous[platform] = version;
    }
  }
} catch (error) {
  console.warn(`Could not read the last published JSON: ${error.message}`);
}
const errors = [];
async function fetchOrKeep(platform, fetchVersion) {
  try {
    return assertVersion(await fetchVersion(), platform);
  } catch (error) {
    const version = assertVersion(previous[platform], `${platform} fallback`);
    errors.push(platform);
    console.warn(`${platform} lookup failed; keeping ${version}: ${error.message}`);
    return version;
  }
}

const [ios, android] = await Promise.all([
  fetchOrKeep('ios', fetchIosVersion),
  fetchOrKeep('android', fetchAndroidVersion),
]);

const output = `${JSON.stringify(
  {
    _: 'Store versions read from the live listings during GitHub Pages deployment.',
    ios,
    android,
  },
  null,
  2,
)}\n`;
if (output !== previousJson) await writeFile(OUTPUT, output);

console.log(`Synced App Store ${ios} and Play Store ${android}`);
if (errors.length) {
  throw new Error(`Store version sync failed for: ${errors.join(', ')}`);
}
