import manifest from 'manifest';

test('plugin manifest contains the enhanced emojis metadata', () => {
    expect(manifest).toBeDefined();
    expect(manifest.id).toBe('de.dakosy.enhanced-emojis');
    expect(manifest.name).toBe('Enhanced Emojis');
    expect(manifest.description).toBe('Enhances the display of custom and standard emojis.');
});
