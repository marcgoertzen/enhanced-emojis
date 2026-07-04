const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const childProcess = require('node:child_process');

const rootDir = path.resolve(__dirname, '..');
const pluginManifestPath = path.join(rootDir, 'plugin.json');
const buildInfoPath = path.join(rootDir, 'webapp', 'src', 'build-info.ts');

function resolveGitCommit(execFileSync = childProcess.execFileSync) {
    try {
        return execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
            cwd: rootDir,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        }).trim() || null;
    } catch {
        return null;
    }
}

function createBuildId(randomBytes = crypto.randomBytes) {
    return randomBytes(8).toString('hex');
}

function createBuildInfo(pluginVersion, options = {}) {
    const now = options.now ?? new Date();
    const buildTimestamp = now.toISOString();
    const gitCommit = options.gitCommit === undefined ? resolveGitCommit(options.execFileSync) : options.gitCommit;

    return {
        pluginVersion,
        buildTimestamp,
        buildEpoch: now.getTime(),
        buildId: options.buildId ?? createBuildId(options.randomBytes),
        gitCommit,
    };
}

function toSingleQuotedString(value) {
    return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, '\\\'')}'`;
}

function createBuildInfoSource(buildInfo) {
    return [
        'export interface EnhancedEmojisBuildInfo {',
        '    pluginVersion: string;',
        '    buildTimestamp: string;',
        '    buildEpoch: number;',
        '    buildId: string;',
        '    gitCommit: string | null;',
        '}',
        '',
        'const buildInfo: EnhancedEmojisBuildInfo = {',
        `    pluginVersion: ${toSingleQuotedString(buildInfo.pluginVersion)},`,
        `    buildTimestamp: ${toSingleQuotedString(buildInfo.buildTimestamp)},`,
        `    buildEpoch: ${buildInfo.buildEpoch},`,
        `    buildId: ${toSingleQuotedString(buildInfo.buildId)},`,
        `    gitCommit: ${buildInfo.gitCommit === null ? 'null' : toSingleQuotedString(buildInfo.gitCommit)},`,
        '};',
        '',
        'export default buildInfo;',
        '',
    ].join('\n');
}

function writeBuildInfoFile(filePath = buildInfoPath) {
    const pluginManifest = JSON.parse(fs.readFileSync(pluginManifestPath, 'utf8'));
    const buildInfo = createBuildInfo(pluginManifest.version);
    fs.writeFileSync(filePath, createBuildInfoSource(buildInfo), 'utf8');
    return buildInfo;
}

function main() {
    const buildInfo = writeBuildInfoFile();
    console.log(`Updated webapp/src/build-info.ts (${buildInfo.buildId}).`);
}

if (require.main === module) {
    main();
}

module.exports = {
    createBuildId,
    createBuildInfo,
    createBuildInfoSource,
    resolveGitCommit,
    writeBuildInfoFile,
};
