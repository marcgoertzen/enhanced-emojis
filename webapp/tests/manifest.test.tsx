import fs from 'node:fs';
import path from 'node:path';

import manifest from '../src/manifest';

test('plugin manifest contains the enhanced emojis metadata', () => {
    expect(manifest).toBeDefined();
    expect(manifest.id).toBe('io.github.marcgoertzen.enhanced-emojis');
    expect(manifest.name).toBe('Enhanced Emojis');
    expect(manifest.version).toBe('0.5.0');
    expect(manifest.description).toBe('Mattermost plugin for improving custom and standard emoji rendering in posts and reactions.');
});

test('plugin schema exposes explicit custom and standard admin gates', () => {
    const pluginManifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../plugin.json'), 'utf8')) as {
        settings_schema: {settings: Array<{key: string}>};
    };
    expect(pluginManifest.settings_schema.settings.map((setting) => setting.key)).toEqual([
        'EnableCustomPostEmojis',
        'EnableCustomReactionEmojis',
        'EnableStandardPostEmojis',
        'EnableStandardReactionEmojis',
        'EnableDeveloperMode',
    ]);
});
