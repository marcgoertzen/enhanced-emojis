import manifest from '../src/manifest';

test('plugin manifest contains the enhanced emojis metadata', () => {
    expect(manifest).toBeDefined();
    expect(manifest.id).toBe('io.github.marcgoertzen.enhanced-emojis');
    expect(manifest.name).toBe('Enhanced Emojis');
    expect(manifest.version).toBe('0.4.0');
    expect(manifest.description).toBe('Mattermost plugin for improving custom emoji rendering in posts and reactions.');
});
