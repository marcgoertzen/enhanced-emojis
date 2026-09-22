import fs from 'node:fs';
import path from 'node:path';

const styles = fs.readFileSync(path.resolve(__dirname, '../src/styles.css'), 'utf8');

test('post emoji selectors use separate custom and standard size variables', () => {
    expect(styles).toContain('enhanced-emojis-standard-posts-enabled');
    expect(styles).toContain('emoticon--unicode.enhanced-emojis-standard-post-emoji.enhanced-emojis-post-emoji-standalone');
    expect(styles).toContain('enhanced-emojis-custom-posts-enabled');
    expect(styles).toContain('width: var(--enhanced-emojis-custom-post-size) !important;');
    expect(styles).toContain('width: var(--enhanced-emojis-standard-post-size) !important;');
    expect(styles).toContain('font-size: var(--enhanced-emojis-standard-post-size) !important;');
    expect(styles).toContain('font-size: var(--enhanced-emojis-standard-inline-post-size) !important;');
});

test('standard reaction selectors are restricted to Mattermost system emoji assets', () => {
    expect(styles).toContain('enhanced-emojis-custom-reactions-enabled');
    expect(styles).toContain('enhanced-emojis-standard-reactions-enabled');
    expect(styles).toContain('img.Reaction__emoji.emoticon[src*="/static/emoji/"]');
    expect(styles).toContain('width: var(--enhanced-emojis-custom-reaction-size) !important;');
    expect(styles).toContain('width: var(--enhanced-emojis-standard-reaction-size) !important;');
});
