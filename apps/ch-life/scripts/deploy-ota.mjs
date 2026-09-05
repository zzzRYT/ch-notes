import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const args = process.argv.slice(2);
const hasFlag = (flag) => args.includes(flag);

if (hasFlag("--help")) {
  console.log(`Usage:
  pnpm deploy:ota
  pnpm deploy:ota -- --message "fix: 변경 요약"
  pnpm deploy:ota -- --platform ios

The command deploys a signed update to the production channel for the app
version declared in app.config.ts. Run it from a clean main branch.

Options passed after -- are forwarded to hot-updater deploy.
Local safeguards: --allow-non-main, --allow-dirty, --dry-run`);
  process.exit(0);
}

const localFlags = new Set([
  "--",
  "--allow-non-main",
  "--allow-dirty",
  "--dry-run",
]);
const deployArgs = args.filter((arg) => !localFlags.has(arg));

function fail(message) {
  console.error(`OTA deploy blocked: ${message}`);
  process.exit(1);
}

const blockedOptions = [
  ["--channel", "-c"],
  ["--target-app-version", "-t"],
  ["--force-update", "-f"],
];
for (const options of blockedOptions) {
  if (options.some((option) => deployArgs.includes(option))) {
    fail(`${options[0]} is controlled by deploy:ota and cannot be overridden`);
  }
}

function output(command, commandArgs) {
  return execFileSync(command, commandArgs, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  }).trim();
}

const branch = output("git", ["branch", "--show-current"]);
if (branch !== "main" && !hasFlag("--allow-non-main")) {
  fail(`current branch is ${branch || "detached HEAD"}; merge to main first`);
}

const worktree = output("git", ["status", "--short"]);
if (worktree && !hasFlag("--allow-dirty")) {
  fail("working tree is not clean; commit or stash changes first");
}

const envPath = ".env.hotupdater";
if (!existsSync(envPath)) fail(`${envPath} does not exist`);

const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const separator = line.indexOf("=");
      return [line.slice(0, separator), line.slice(separator + 1)];
    }),
);

const required = [
  "HOT_UPDATER_CLOUDFLARE_ACCOUNT_ID",
  "HOT_UPDATER_CLOUDFLARE_API_TOKEN",
  "HOT_UPDATER_CLOUDFLARE_D1_DATABASE_ID",
  "HOT_UPDATER_CLOUDFLARE_R2_BUCKET_NAME",
  "HOT_UPDATER_CLOUDFLARE_R2_ACCESS_KEY_ID",
  "HOT_UPDATER_CLOUDFLARE_R2_SECRET_ACCESS_KEY",
];
const missing = required.filter((key) => !env[key]);
if (missing.length > 0) fail(`missing ${missing.join(", ")} in ${envPath}`);

if (env.HOT_UPDATER_CLOUDFLARE_R2_ACCESS_KEY_ID.length !== 32) {
  fail(
    "R2 access key ID must be the 32-character S3 Access Key ID, not the Cloudflare API token",
  );
}
if (env.HOT_UPDATER_CLOUDFLARE_R2_SECRET_ACCESS_KEY.length !== 64) {
  fail("R2 secret access key must be the 64-character S3 Secret Access Key");
}
if (!existsSync("keys/private-key.pem")) {
  fail("keys/private-key.pem does not exist");
}

let appConfig;
try {
  appConfig = JSON.parse(
    output("pnpm", ["exec", "expo", "config", "--type", "public", "--json"]),
  );
} catch {
  fail("could not resolve the Expo app version");
}

const targetAppVersion = appConfig.version;
if (!targetAppVersion) fail("app.config.ts does not declare a version");

const commandArgs = [
  "exec",
  "hot-updater",
  "deploy",
  "--channel",
  "production",
  "--target-app-version",
  targetAppVersion,
  ...deployArgs,
];

console.log(
  `Deploying signed OTA: channel=production appVersion=${targetAppVersion}`,
);
if (hasFlag("--dry-run")) {
  console.log(`Dry run: pnpm ${commandArgs.join(" ")}`);
  process.exit(0);
}

const result = spawnSync("pnpm", commandArgs, { stdio: "inherit" });
process.exit(result.status ?? 1);
