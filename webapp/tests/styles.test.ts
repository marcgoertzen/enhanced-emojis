import fs from 'node:fs';
import path from 'node:path';

const styles = fs.readFileSync(path.resolve(__dirname, '../src/styles.css'), 'utf8');

test('declares plugin-owned CSS variable defaults', () => {
    expect(styles).toContain(':root {');
    expect(styles).toContain('--enhanced-emojis-custom-post-size: 32px;');
    expect(styles).toContain('--enhanced-emojis-custom-inline-post-size: 20px;');
    expect(styles).toContain('--enhanced-emojis-custom-reaction-size: 20px;');
    expect(styles).toContain('--enhanced-emojis-standard-post-size: 32px;');
    expect(styles).toContain('--enhanced-emojis-standard-inline-post-size: 20px;');
    expect(styles).toContain('--enhanced-emojis-standard-reaction-size: 20px;');
    expect(styles).toContain('--enhanced-emojis-custom-reaction-chip-padding-inline: 4px;');
    expect(styles).toContain('--enhanced-emojis-custom-reaction-chip-padding-block: 2px;');
    expect(styles).toContain('--enhanced-emojis-custom-reaction-chip-gap: 2px;');
    expect(styles).toContain('--enhanced-emojis-custom-reaction-chip-min-height: 24px;');
    expect(styles).toContain('--enhanced-emojis-standard-reaction-chip-padding-inline: 4px;');
    expect(styles).toContain('--enhanced-emojis-standard-reaction-chip-padding-block: 2px;');
    expect(styles).toContain('--enhanced-emojis-standard-reaction-chip-gap: 2px;');
    expect(styles).toContain('--enhanced-emojis-standard-reaction-chip-min-height: 24px;');
});

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

test('developer highlighting covers recognized custom and standard post and reaction emojis', () => {
    expect(styles).toContain('html.enhanced-emojis-developer-mode.enhanced-emojis-custom-posts-enabled');
    expect(styles).toContain('html.enhanced-emojis-developer-mode.enhanced-emojis-standard-posts-enabled');
    expect(styles).toContain('html.enhanced-emojis-developer-mode.enhanced-emojis-custom-reactions-enabled');
    expect(styles).toContain('html.enhanced-emojis-developer-mode.enhanced-emojis-standard-reactions-enabled');
    expect(styles).toContain('outline: 2px solid red;');
});

test('emoji size setting options use consistent radio-label spacing', () => {
    expect(styles).toContain('.enhanced-emojis-preference-setting__option');
    expect(styles).toContain('display: flex;');
    expect(styles).toContain('align-items: center;');
    expect(styles).toContain('gap: 6px;');
    expect(styles).toContain("input[type='radio']");
    expect(styles).toContain('margin: 0;');
});
