const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const pluginManifestPath = path.join(rootDir, 'plugin.json');
const pluginManifest = JSON.parse(fs.readFileSync(pluginManifestPath, 'utf8'));

if (!pluginManifest.id) {
    console.error('plugin.json is missing `id`.');
    process.exit(1);
}

const bundleSource = path.join(rootDir, 'webapp', 'dist', 'main.js');
if (!fs.existsSync(bundleSource)) {
    console.error('Missing webapp/dist/main.js. Run `npm run build:webapp` first.');
    process.exit(1);
}

const pluginId = pluginManifest.id;
const stagingDir = path.join(distDir, pluginId);
const archivePath = path.join(distDir, `${pluginId}.tar.gz`);
const archiveFileName = `${pluginId}.tar.gz`;

fs.rmSync(stagingDir, {recursive: true, force: true});
fs.rmSync(archivePath, {force: true});
fs.mkdirSync(path.join(stagingDir, 'webapp', 'dist'), {recursive: true});

fs.copyFileSync(pluginManifestPath, path.join(stagingDir, 'plugin.json'));
fs.copyFileSync(bundleSource, path.join(stagingDir, 'webapp', 'dist', 'main.js'));

copyOptionalDirectory('assets');
copyOptionalDirectory('public');

const tarResult = spawnSync('tar', ['-czf', archiveFileName, pluginId], {
    cwd: distDir,
    stdio: 'inherit',
});

if (tarResult.error) {
    console.error('Failed to create plugin archive with `tar`.', tarResult.error.message);
    process.exit(1);
}

if (tarResult.status !== 0) {
    process.exit(tarResult.status);
}

console.log(`Created ${path.relative(rootDir, archivePath)}`);

function copyOptionalDirectory(directoryName) {
    const sourceDir = path.join(rootDir, directoryName);
    if (!fs.existsSync(sourceDir)) {
        return;
    }

    const entries = fs.readdirSync(sourceDir).filter((entry) => entry !== '.DS_Store');
    if (entries.length === 0) {
        return;
    }

    fs.cpSync(sourceDir, path.join(stagingDir, directoryName), {recursive: true});
}
