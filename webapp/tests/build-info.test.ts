import childProcess from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

describe('build info generation', () => {
    const rootDir = path.resolve(__dirname, '..', '..');
    const buildInfoPath = path.join(rootDir, 'webapp', 'src', 'build-info.ts');
    const pluginManifestPath = path.join(rootDir, 'plugin.json');
    const generateBuildInfoScriptPath = path.join(rootDir, 'scripts', 'generate-build-info.js');

    test('generator creates the build info file with all required fields', () => {
        childProcess.execFileSync(process.execPath, [generateBuildInfoScriptPath], {cwd: rootDir});
        const buildInfoSource = fs.readFileSync(buildInfoPath, 'utf8');
        const pluginManifest = JSON.parse(fs.readFileSync(pluginManifestPath, 'utf8'));

        expect(buildInfoSource).toContain('export interface EnhancedEmojisBuildInfo');
        expect(buildInfoSource).toContain(`pluginVersion: '${pluginManifest.version}'`);
        expect(buildInfoSource).toMatch(/buildTimestamp: '\d{4}-\d{2}-\d{2}T[^']+'/);
        expect(buildInfoSource).toMatch(/buildEpoch: \d+/);
        expect(buildInfoSource).toMatch(/buildId: '[a-f0-9]{16}'/);
        expect(buildInfoSource).toMatch(/gitCommit: (null|'[a-f0-9]+')/);
    });

    test('generated build info is available in the plugin bundle', () => {
        const buildInfo = require('../src/build-info').default;

        expect(buildInfo.pluginVersion).toBeTruthy();
        expect(buildInfo.buildTimestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        expect(Number.isFinite(buildInfo.buildEpoch)).toBe(true);
        expect(buildInfo.buildId).toMatch(/^[a-f0-9]{16}$/);
        expect(Object.prototype.hasOwnProperty.call(buildInfo, 'gitCommit')).toBe(true);
    });
});
