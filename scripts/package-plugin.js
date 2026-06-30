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
const tarPath = path.join(distDir, `${pluginId}.tar`);
const archivePath = path.join(distDir, `${pluginId}.tar.gz`);
const tarFileName = `${pluginId}.tar`;

fs.rmSync(stagingDir, {recursive: true, force: true});
fs.rmSync(tarPath, {force: true});
fs.rmSync(archivePath, {force: true});
fs.mkdirSync(path.join(stagingDir, 'webapp', 'dist'), {recursive: true});

fs.copyFileSync(pluginManifestPath, path.join(stagingDir, 'plugin.json'));
fs.copyFileSync(bundleSource, path.join(stagingDir, 'webapp', 'dist', 'main.js'));
copyDeclaredServerExecutables();

copyOptionalDirectory('assets');
copyOptionalDirectory('public');

const unixExecutables = getDeclaredUnixServerExecutables();
const tarCreateArgs = ['-cf', tarFileName];

for (const unixExecutable of unixExecutables) {
    tarCreateArgs.push(`--exclude=${path.posix.join(pluginId, unixExecutable.replace(/\\/g, '/'))}`);
}

tarCreateArgs.push(pluginId);

const tarCreateResult = spawnSync('tar', tarCreateArgs, {
    cwd: distDir,
    stdio: 'inherit',
});

if (tarCreateResult.error) {
    console.error('Failed to create plugin tar archive with `tar`.', tarCreateResult.error.message);
    process.exit(1);
}

if (tarCreateResult.status !== 0) {
    process.exit(tarCreateResult.status);
}

if (unixExecutables.length > 0) {
    const tarAppendResult = spawnSync(
        'tar',
        ['-rf', tarFileName, '--mode=755', ...unixExecutables.map((relativePath) => path.posix.join(pluginId, relativePath.replace(/\\/g, '/')))],
        {
            cwd: distDir,
            stdio: 'inherit',
        },
    );

    if (tarAppendResult.error) {
        console.error('Failed to append Unix server executables to the plugin tar archive.', tarAppendResult.error.message);
        process.exit(1);
    }

    if (tarAppendResult.status !== 0) {
        process.exit(tarAppendResult.status);
    }
}

const gzipResult = spawnSync('gzip', ['-f', tarFileName], {
    cwd: distDir,
    stdio: 'inherit',
});

if (gzipResult.error) {
    console.error('Failed to gzip the plugin tar archive.', gzipResult.error.message);
    process.exit(1);
}

if (gzipResult.status !== 0) {
    process.exit(gzipResult.status);
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

function copyDeclaredServerExecutables() {
    const serverManifest = pluginManifest.server;
    if (!serverManifest) {
        return;
    }

    const declaredExecutables = new Set([
        serverManifest.executable,
        ...Object.values(serverManifest.executables || {}),
    ]);

    for (const relativeExecutablePath of declaredExecutables) {
        if (!relativeExecutablePath) {
            continue;
        }

        const unixExecutable = isUnixExecutable(relativeExecutablePath);
        const sourcePath = path.join(rootDir, relativeExecutablePath);
        if (!fs.existsSync(sourcePath)) {
            console.error(`Missing server executable ${relativeExecutablePath}. Run \`npm run build:server\` first.`);
            process.exit(1);
        }

        if (unixExecutable) {
            fs.chmodSync(sourcePath, 0o755);
        }

        const destinationPath = path.join(stagingDir, relativeExecutablePath);
        fs.mkdirSync(path.dirname(destinationPath), {recursive: true});
        fs.copyFileSync(sourcePath, destinationPath);

        if (unixExecutable) {
            fs.chmodSync(destinationPath, 0o755);
        }
    }
}

function isUnixExecutable(relativePath) {
    return !relativePath.endsWith('.exe');
}

function getDeclaredUnixServerExecutables() {
    const serverManifest = pluginManifest.server;
    if (!serverManifest) {
        return [];
    }

    return Object.values(serverManifest.executables || {}).filter((relativePath) => relativePath && isUnixExecutable(relativePath));
}
