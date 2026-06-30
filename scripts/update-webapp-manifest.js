const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const pluginManifestPath = path.join(rootDir, 'plugin.json');
const webappManifestPath = path.join(rootDir, 'webapp', 'src', 'manifest.ts');
const checkOnly = process.argv.includes('--check');

const pluginManifest = JSON.parse(fs.readFileSync(pluginManifestPath, 'utf8'));
const manifestSource = [
    'const manifest = {',
    `    id: ${JSON.stringify(pluginManifest.id)},`,
    `    name: ${JSON.stringify(pluginManifest.name)},`,
    `    version: ${JSON.stringify(pluginManifest.version)},`,
    `    description: ${JSON.stringify(pluginManifest.description)},`,
    `    min_server_version: ${JSON.stringify(pluginManifest.min_server_version)},`,
    '    webapp: {',
    `        bundle_path: ${JSON.stringify(pluginManifest.webapp.bundle_path)},`,
    '    },',
    '};',
    '',
    'export default manifest;',
    '',
].join('\n');

if (checkOnly) {
    const currentManifest = fs.readFileSync(webappManifestPath, 'utf8').replace(/\r\n/g, '\n');
    if (currentManifest !== manifestSource) {
        console.error('webapp/src/manifest.ts is out of sync with plugin.json. Run `npm run sync-manifest`.');
        process.exit(1);
    }

    process.exit(0);
}

fs.writeFileSync(webappManifestPath, manifestSource, 'utf8');
console.log('Updated webapp/src/manifest.ts from plugin.json.');
