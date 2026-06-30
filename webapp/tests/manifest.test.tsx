import manifest from '../src/manifest';

test('plugin manifest contains the enhanced emojis metadata', () => {
    expect(manifest).toBeDefined();
    expect(manifest.id).toBe('de.dakosy.enhanced-emojis');
    expect(manifest.name).toBe('Enhanced Emojis');
    expect(manifest.version).toBe('0.2.0');
    expect(manifest.description).toBe('Enhances the display of custom emojis in Mattermost.');
});
