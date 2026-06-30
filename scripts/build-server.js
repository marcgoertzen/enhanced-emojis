const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const rootDir = path.resolve(__dirname, '..');
const pluginManifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'plugin.json'), 'utf8'));
const serverManifest = pluginManifest.server;

if (!serverManifest || !serverManifest.executables) {
    console.error('plugin.json is missing `server.executables`.');
    process.exit(1);
}

const executableTargets = Object.entries(serverManifest.executables);

for (const [target, relativeOutputPath] of executableTargets) {
    const [goos, goarch] = target.split('-');
    const absoluteOutputPath = path.join(rootDir, relativeOutputPath);

    fs.mkdirSync(path.dirname(absoluteOutputPath), {recursive: true});

    const result = spawnSync('go', ['build', '-o', absoluteOutputPath, './server'], {
        cwd: rootDir,
        stdio: 'inherit',
        env: {
            ...process.env,
            CGO_ENABLED: '0',
            GOOS: goos,
            GOARCH: goarch,
        },
    });

    if (result.error) {
        console.error(`Failed to build server executable for ${target}.`, result.error.message);
        process.exit(1);
    }

    if (result.status !== 0) {
        process.exit(result.status);
    }

    if (goos === 'linux' || goos === 'darwin') {
        fs.chmodSync(absoluteOutputPath, 0o755);
    }
}

console.log(`Built ${executableTargets.length} server executable(s).`);
